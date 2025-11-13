import { useState } from 'react';
import DemoLayout from '../components/demo/DemoLayout';
import DemoIntro from '../components/demo/sections/DemoIntro';
import DemoSearch from '../components/demo/sections/DemoSearch';
import DemoProfile from '../components/demo/sections/DemoProfile';
import DemoBooking from '../components/demo/sections/DemoBooking';
import DemoPayment from '../components/demo/sections/DemoPayment';
import DemoChat from '../components/demo/sections/DemoChat';
import DemoReview from '../components/demo/sections/DemoReview';
import DemoFeatures from '../components/demo/sections/DemoFeatures';

const DemoPage = () => {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      id: 'intro',
      title: 'Introdução',
      component: DemoIntro,
      duration: 15,
    },
    {
      id: 'search',
      title: 'Busca de Artistas',
      component: DemoSearch,
      duration: 20,
    },
    {
      id: 'profile',
      title: 'Perfil do Artista',
      component: DemoProfile,
      duration: 20,
    },
    {
      id: 'booking',
      title: 'Criar Booking',
      component: DemoBooking,
      duration: 25,
    },
    {
      id: 'payment',
      title: 'Pagamento',
      component: DemoPayment,
      duration: 30,
    },
    {
      id: 'chat',
      title: 'Chat em Tempo Real',
      component: DemoChat,
      duration: 25,
    },
    {
      id: 'review',
      title: 'Sistema de Avaliação',
      component: DemoReview,
      duration: 20,
    },
    {
      id: 'features',
      title: 'Recursos e Planos',
      component: DemoFeatures,
      duration: 20,
    },
  ];

  const CurrentComponent = sections[currentSection].component;

  return (
    <DemoLayout
      sections={sections}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      <CurrentComponent />
    </DemoLayout>
  );
};

export default DemoPage;
