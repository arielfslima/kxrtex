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
        <h2 className="text-4xl font-bold text-white">Chat em Tempo Real</h2>
        <p className="text-gray-400 text-lg">
          Comunicação segura com detecção de anti-circumvenção
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-dark-700 px-6 py-4 border-b border-dark-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/40?img=33"
                    alt="DJ Phoenix"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-700 rounded-full"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">DJ Phoenix</div>
                  <div className="text-xs text-green-400">Online</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Booking: #DEMO-001
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dark-900/50">
              {messages.map((message) => {
                const isSystem = message.tipo === 'SISTEMA';
                const isSent = message.remetente?.id === 'demo-contratante-1';

                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 max-w-md text-center">
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <span className="text-yellow-500">⚠️</span>
                          <span className="text-xs font-semibold text-yellow-400 uppercase">
                            Aviso do Sistema
                          </span>
                        </div>
                        <p className="text-sm text-yellow-300">
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
                      className={`max-w-md ${
                        isSent
                          ? 'bg-gradient-to-r from-red-vibrant to-pink-600'
                          : 'bg-dark-700'
                      } rounded-2xl px-4 py-3`}
                    >
                      {!isSent && (
                        <div className="text-xs font-semibold text-gray-400 mb-1">
                          {message.remetente?.usuario?.nome || message.remetente?.nomeArtistico}
                        </div>
                      )}
                      <p className="text-white text-sm">{message.conteudo}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isSent ? 'text-white/70' : 'text-gray-500'
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
                  <div className="bg-dark-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="bg-dark-700 px-6 py-4 border-t border-dark-600">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  disabled
                  className="flex-1 bg-dark-800 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 transition font-medium">
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recursos do Chat
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="text-green-500 text-xl">✓</div>
                <div>
                  <div className="text-white font-medium">Tempo Real</div>
                  <div className="text-gray-400">
                    Mensagens instantâneas via Socket.IO
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-500 text-xl">✓</div>
                <div>
                  <div className="text-white font-medium">Status Online</div>
                  <div className="text-gray-400">
                    Veja quando o outro usuário está online
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-500 text-xl">✓</div>
                <div>
                  <div className="text-white font-medium">Indicador de Digitação</div>
                  <div className="text-gray-400">
                    Saiba quando estão respondendo
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-500 text-xl">✓</div>
                <div>
                  <div className="text-white font-medium">Histórico Completo</div>
                  <div className="text-gray-400">
                    Todas as mensagens salvas
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span>👁️</span>
              Anti-Circumvenção
            </h4>
            <p className="text-sm text-red-300 mb-2">
              Sistema detecta automaticamente:
            </p>
            <ul className="text-sm text-red-300 space-y-1">
              <li>• Números de telefone</li>
              <li>• Endereços de e-mail</li>
              <li>• Redes sociais (@usuario)</li>
              <li>• Links externos</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-red-500/30">
              <p className="text-xs text-red-400">
                Violações podem resultar em suspensão da conta
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="font-semibold text-blue-400 mb-2">
              📋 Boas Práticas
            </h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Seja profissional e respeitoso</li>
              <li>• Mantenha tudo na plataforma</li>
              <li>• Confirme detalhes por escrito</li>
              <li>• Responda prontamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoChat;
