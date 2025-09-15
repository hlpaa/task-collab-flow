import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Users, Settings, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { InviteMemberDialog } from '@/components/InviteMemberDialog';
import { useToast } from '@/hooks/use-toast';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: members } = useQuery({
    queryKey: ['project-members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .eq('project_id', id);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: 'todo' | 'in_progress' | 'completed' }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast({
        title: "Tarefa atualizada!",
        description: "O status da tarefa foi alterado com sucesso.",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      toast({
        title: "Tarefa excluída!",
        description: "A tarefa foi removida com sucesso.",
      });
    },
  });

  if (projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <h1 className="text-xl font-semibold mb-2">Projeto não encontrado</h1>
            <p className="text-muted-foreground mb-4">
              Este projeto não existe ou você não tem permissão para acessá-lo.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todoTasks = tasks?.filter(task => task.status === 'todo') || [];
  const inProgressTasks = tasks?.filter(task => task.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowCreateTask(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowInviteMember(true)}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Convidar Membro
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {members?.length || 0} membro(s)
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {tasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* A Fazer */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">A Fazer</h2>
                <Badge variant="secondary">{todoTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => updateTaskMutation.mutate({ taskId: task.id, status })}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                  />
                ))}
                {todoTasks.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma tarefa</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Em Progresso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">Em Progresso</h2>
                <Badge variant="default">{inProgressTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => updateTaskMutation.mutate({ taskId: task.id, status })}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                  />
                ))}
                {inProgressTasks.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma tarefa</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Concluído */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">Concluído</h2>
                <Badge variant="secondary">{completedTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => updateTaskMutation.mutate({ taskId: task.id, status })}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                  />
                ))}
                {completedTasks.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma tarefa</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateTaskDialog 
        open={showCreateTask} 
        onOpenChange={setShowCreateTask}
        projectId={id!}
      />

      <InviteMemberDialog
        open={showInviteMember}
        onOpenChange={setShowInviteMember}
        projectId={id!}
      />
    </div>
  );
}