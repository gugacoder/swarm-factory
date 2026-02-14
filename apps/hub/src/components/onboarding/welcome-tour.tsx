import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bot, FolderKanban, Zap, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    icon: Bot,
    title: 'Conheça a Kai',
    description: 'Sua copilot inteligente que gerencia projetos, monitora loops e sugere ações corretivas.',
  },
  {
    icon: FolderKanban,
    title: 'Gerencie Projetos',
    description: 'Crie, configure e acompanhe seus projetos de software autônomo em um painel centralizado.',
  },
  {
    icon: Zap,
    title: 'Loops Autônomos',
    description: 'O Ralph Wiggum Loop implementa features automaticamente — você acompanha em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Monitore Tudo',
    description: 'Features, sessões, logs e notificações — tudo acessível pelo celular ou desktop.',
  },
];

interface WelcomeTourProps {
  onComplete: () => void;
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{current.title}</h2>
            <p className="text-muted-foreground">{current.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={onComplete}>Pular</Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Anterior</Button>
            )}
            <Button onClick={() => isLast ? onComplete() : setStep(step + 1)}>
              {isLast ? 'Começar' : 'Próximo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
