import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Loader2, MicOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface BrainDumpInputProps {
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
  remainingDumps?: number;
  isPremium?: boolean;
  isAuthenticated?: boolean;
}

export const BrainDumpInput: React.FC<BrainDumpInputProps> = ({ 
  onSubmit, 
  isProcessing = false,
  remainingDumps,
  isPremium = false,
  isAuthenticated = false
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (input.trim() && isAuthenticated) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startVoiceInput = async () => {
    if (!isAuthenticated) return;
    
    try {
      if (!isListening) {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        audioChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
          
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsListening(true);
        
        toast({
          title: "Recording started",
          description: "Speak now... Click the microphone again to stop.",
        });
      } else {
        // Stop recording
        mediaRecorderRef.current?.stop();
        setIsListening(false);
        setIsTranscribing(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);
      
      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded');
      }
      
      if (audioBlob.size > 25 * 1024 * 1024) { // 25MB limit
        throw new Error('Audio file too large. Please record shorter clips.');
      }
      
      // Use FileReader for more reliable base64 conversion
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data:audio/webm;base64, prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read audio file'));
        reader.readAsDataURL(audioBlob);
      });
      
      console.log('Base64 audio length:', base64Audio.length);
      console.log('Sending audio for transcription...');
      
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });
      
      console.log('Transcription response:', { data, error });
      
      if (error) {
        console.error('Transcription error:', error);
        throw new Error(error.message || 'Transcription service error');
      }
      
      if (data?.text?.trim()) {
        const transcribedText = data.text.trim();
        console.log('Transcribed text:', transcribedText);
        setInput(prev => prev ? `${prev} ${transcribedText}` : transcribedText);
        toast({
          title: "Transcription complete",
          description: `"${transcribedText.slice(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`,
        });
      } else {
        console.warn('No text returned from transcription service');
        toast({
          title: "No speech detected",
          description: "Please try speaking more clearly and ensure your microphone is working.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Transcription failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={!isAuthenticated ? "Please sign in to start brain dumping..." : "What's on your mind? Dump your thoughts here..."}
          className="min-h-[120px] pr-20 resize-none bg-card/50 backdrop-blur-sm border-2 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300"
          disabled={isProcessing || !isAuthenticated}
        />
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={startVoiceInput}
            disabled={isProcessing || isTranscribing || !isAuthenticated}
            className="hover:bg-primary/10 transition-all duration-300"
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : isListening ? (
              <MicOff className="h-4 w-4 text-destructive animate-pulse" />
            ) : (
              <Mic className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing || !isAuthenticated}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all duration-300"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted-foreground">
          {isAuthenticated ? (
            <>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘ + Enter</kbd> to submit</>
          ) : (
            "Sign in to start brain dumping"
          )}
        </p>
        {isAuthenticated && !isPremium && remainingDumps !== undefined && (
          <div className="text-xs">
            {remainingDumps > 0 ? (
              <span className="text-primary font-medium">
                {remainingDumps} dump{remainingDumps === 1 ? '' : 's'} left today
              </span>
            ) : (
              <span className="text-destructive font-medium">
                Daily limit reached - Upgrade for unlimited dumps!
              </span>
            )}
          </div>
        )}
        {isAuthenticated && isPremium && (
          <p className="text-xs text-primary font-medium">
            ✨ Premium - Unlimited dumps
          </p>
        )}
      </div>
    </div>
  );
};