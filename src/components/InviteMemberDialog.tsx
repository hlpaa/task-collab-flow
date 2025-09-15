import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const InviteMemberDialog = ({ open, onOpenChange, projectId }: InviteMemberDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');

  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error('User not authenticated');

      // For demo purposes, we'll assume the user exists and use a mock user ID
      // In a real implementation, you'd need to implement user lookup properly
      const mockUserId = 'mock-user-' + Date.now();
      
      // For now, just add the member with a placeholder
      // Note: This is a simplified implementation for demo purposes

      // For demo purposes, we'll show a success message
      // In a real implementation, you'd need proper user management
      throw new Error('Funcionalidade de convite será implementada quando o Supabase estiver configurado com as tabelas corretas.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast({
        title: "Membro convidado!",
        description: "O usuário foi adicionado ao projeto com sucesso.",
      });
      setEmail('');
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao convidar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    inviteMemberMutation.mutate(email.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Convide uma pessoa para colaborar neste projeto. Ela deve ter uma conta no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email do Usuário</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!email.trim() || inviteMemberMutation.isPending}
            >
              {inviteMemberMutation.isPending ? "Convidando..." : "Convidar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};