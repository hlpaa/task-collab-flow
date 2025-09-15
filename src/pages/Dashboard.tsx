import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, LogOut, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { ProjectCard } from '@/components/ProjectCard';
import { RecentTasks } from '@/components/RecentTasks';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [showCreateProject, setShowCreateProject] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          projects (
            id,
            name,
            description,
            created_at,
            created_by
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      return data?.map(item => item.projects).filter(Boolean) || [];
    },
    enabled: !!user?.id,
  });

  const { data: recentTasks } = useQuery({
    queryKey: ['recent-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (name)
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
            <p className="text-sm text-muted-foreground">Olá, {user?.email}</p>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Meus Projetos</h2>
                  <p className="text-muted-foreground">Organize suas tarefas em projetos</p>
                </div>
                <Button 
                  onClick={() => setShowCreateProject(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Projeto
                </Button>
              </div>

              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum projeto ainda
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Crie seu primeiro projeto para começar a organizar suas tarefas
                    </p>
                    <Button onClick={() => setShowCreateProject(true)}>
                      Criar Primeiro Projeto
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projetos</span>
                  <span className="font-medium">{projects?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarefas Recentes</span>
                  <span className="font-medium">{recentTasks?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <RecentTasks tasks={recentTasks || []} />
          </div>
        </div>
      </div>

      <CreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject} 
      />
    </div>
  );
}