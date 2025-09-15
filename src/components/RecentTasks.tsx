import { Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  projects: { name: string } | null;
}

interface RecentTasksProps {
  tasks: Task[];
}

const statusConfig = {
  todo: {
    icon: Circle,
    label: 'A fazer',
    variant: 'secondary' as const,
  },
  in_progress: {
    icon: AlertCircle,
    label: 'Em progresso',
    variant: 'default' as const,
  },
  completed: {
    icon: CheckCircle,
    label: 'Concluído',
    variant: 'secondary' as const,
  },
};

export const RecentTasks = ({ tasks }: RecentTasksProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Tarefas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              return (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <StatusIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusConfig[task.status].variant} className="text-xs">
                        {statusConfig[task.status].label}
                      </Badge>
                      {task.projects && (
                        <span className="text-xs text-muted-foreground">
                          {task.projects.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma tarefa recente
          </p>
        )}
      </CardContent>
    </Card>
  );
};