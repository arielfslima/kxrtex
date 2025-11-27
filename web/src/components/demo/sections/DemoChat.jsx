import { useState, useEffect, useRef } from 'react';
import { demoChatMessages } from '../../../data/demoData';

const DemoChat = () => {
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentIndex < demoChatMessages.length) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => [...prev, demoChatMessages[currentIndex]]);
          setCurrentIndex((prev) => prev + 1);
          setIsTyping(false);
        }, 1500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Chat em Tempo Real
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Comunicacao segura com deteccao de anti-circumvencao
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="border-2 border-dark-600 bg-dark-900/50 overflow-hidden flex flex-col h-[600px]">
            <div className="bg-dark-800 px-6 py-4 border-b-2 border-dark-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/40?img=33"
                    alt="DJ Phoenix"
                    className="w-10 h-10 grayscale border-2 border-dark-600"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-acid border-2 border-dark-800"></div>
                </div>
                <div>
                  <div className="font-mono font-bold text-chrome text-sm">DJ Phoenix</div>
                  <div className="text-[10px] font-mono text-neon-acid uppercase tracking-wider">Online</div>
                </div>
              </div>
              <div className="text-xs font-mono text-chrome/50">
                BOOKING: #DEMO-001
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dark-950/50 scrollbar-thin scrollbar-thumb-dark-600">
              {messages.map((message) => {
                const isSystem = message.tipo === 'SISTEMA';
                const isSent = message.remetente?.id === 'demo-contratante-1';

                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="border-2 border-neon-gold/50 bg-neon-gold/10 px-4 py-2 max-w-md text-center">
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <span className="text-neon-gold font-mono text-xs">[!]</span>
                          <span className="text-[10px] font-mono font-bold text-neon-gold uppercase tracking-wider">
                            Aviso do Sistema
                          </span>
                        </div>
                        <p className="text-xs font-mono text-neon-gold/80">
                          {message.conteudo}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md border-2 px-4 py-3 ${
                        isSent
                          ? 'border-neon-red bg-neon-red/10'
                          : 'border-dark-600 bg-dark-800'
                      }`}
                    >
                      {!isSent && (
                        <div className="text-[10px] font-mono font-bold text-chrome/50 uppercase tracking-wider mb-1">
                          {message.remetente?.usuario?.nome || message.remetente?.nomeArtistico}
                        </div>
                      )}
                      <p className="text-chrome font-mono text-sm">{message.conteudo}</p>
                      <div
                        className={`text-[10px] font-mono mt-1 ${
                          isSent ? 'text-neon-red/70' : 'text-chrome/30'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="border-2 border-dark-600 bg-dark-800 px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-chrome/50 animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-chrome/50 animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-chrome/50 animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="bg-dark-800 px-6 py-4 border-t-2 border-dark-600">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  disabled
                  className="flex-1 px-4 py-3 bg-dark-900 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30"
                />
                <button className="px-6 py-3 border-2 border-neon-red bg-neon-red text-dark-950 font-mono text-xs font-bold uppercase">
                  ENVIAR
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
            <h3 className="text-sm font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2 mb-4">
              [RECURSOS DO CHAT]
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-start gap-3">
                <span className="text-neon-acid">[OK]</span>
                <div>
                  <div className="text-chrome font-bold">Tempo Real</div>
                  <div className="text-chrome/50">Mensagens instantaneas via Socket.IO</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-neon-acid">[OK]</span>
                <div>
                  <div className="text-chrome font-bold">Status Online</div>
                  <div className="text-chrome/50">Veja quando o outro usuario esta online</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-neon-acid">[OK]</span>
                <div>
                  <div className="text-chrome font-bold">Indicador de Digitacao</div>
                  <div className="text-chrome/50">Saiba quando estao respondendo</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-neon-acid">[OK]</span>
                <div>
                  <div className="text-chrome font-bold">Historico Completo</div>
                  <div className="text-chrome/50">Todas as mensagens salvas</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-neon-red/30 bg-neon-red/5 p-4">
            <h4 className="font-mono font-bold text-neon-red text-xs uppercase tracking-wider mb-2">
              [!] ANTI-CIRCUMVENCAO
            </h4>
            <p className="text-xs font-mono text-neon-red/80 mb-2">
              Sistema detecta automaticamente:
            </p>
            <ul className="text-xs font-mono text-neon-red/70 space-y-1">
              <li>- Numeros de telefone</li>
              <li>- Enderecos de e-mail</li>
              <li>- Redes sociais (@usuario)</li>
              <li>- Links externos</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-neon-red/30">
              <p className="text-[10px] font-mono text-neon-red/60 uppercase">
                Violacoes podem resultar em suspensao da conta
              </p>
            </div>
          </div>

          <div className="border-2 border-neon-cyan/30 bg-neon-cyan/5 p-4">
            <h4 className="font-mono font-bold text-neon-cyan text-xs uppercase tracking-wider mb-2">
              [INFO] BOAS PRATICAS
            </h4>
            <ul className="text-xs font-mono text-neon-cyan/80 space-y-1">
              <li>- Seja profissional e respeitoso</li>
              <li>- Mantenha tudo na plataforma</li>
              <li>- Confirme detalhes por escrito</li>
              <li>- Responda prontamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoChat;
