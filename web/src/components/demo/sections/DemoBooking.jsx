import { useState } from 'react';

const DemoBooking = () => {
  const [formData, setFormData] = useState({
    titulo: 'Festival Underground - Edicao Verao',
    descricao: 'Grande festival de musica eletronica underground com publico estimado de 2000 pessoas.',
    dataEvento: '2024-12-15',
    horario: '22:00',
    duracao: 4,
    localEvento: 'Parque Villa-Lobos',
    cidadeEvento: 'Sao Paulo',
    estadoEvento: 'SP',
  });

  const precoBase = 1500;
  const taxaPlataforma = precoBase * 0.07;
  const valorTotal = precoBase + taxaPlataforma;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-dark-600">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Criar Booking
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Solicite um booking preenchendo os detalhes do evento
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border-2 border-dark-600 bg-dark-900/50 p-6 space-y-4">
          <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2">
            [DETALHES DO EVENTO]
          </h3>

          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Titulo do Evento *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Descricao *
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                Data *
              </label>
              <input
                type="date"
                name="dataEvento"
                value={formData.dataEvento}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                Horario *
              </label>
              <input
                type="time"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Duracao (horas) *
            </label>
            <input
              type="number"
              name="duracao"
              value={formData.duracao}
              onChange={handleChange}
              min="1"
              max="12"
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
              Local *
            </label>
            <input
              type="text"
              name="localEvento"
              value={formData.localEvento}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                Cidade *
              </label>
              <input
                type="text"
                name="cidadeEvento"
                value={formData.cidadeEvento}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                Estado *
              </label>
              <input
                type="text"
                name="estadoEvento"
                value={formData.estadoEvento}
                onChange={handleChange}
                maxLength="2"
                className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors uppercase"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
            <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2 mb-4">
              [RESUMO DO BOOKING]
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-dark-700">
                <div className="w-14 h-14 bg-neon-red flex items-center justify-center flex-shrink-0">
                  <span className="text-dark-950 font-mono font-bold text-xl">[DJ]</span>
                </div>
                <div>
                  <div className="font-mono font-bold text-chrome">DJ Phoenix</div>
                  <div className="text-xs font-mono text-chrome/50">Artista</div>
                  <div className="text-xs font-mono text-neon-purple font-bold">PLANO PRO</div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-dark-700 pb-2">
                  <span className="text-chrome/50">PRECO BASE</span>
                  <span className="text-chrome">R$ {precoBase.toLocaleString('pt-BR')}/h</span>
                </div>
                <div className="flex justify-between border-b border-dark-700 pb-2">
                  <span className="text-chrome/50">DURACAO</span>
                  <span className="text-chrome">{formData.duracao}h</span>
                </div>
                <div className="flex justify-between border-b border-dark-700 pb-2">
                  <span className="text-chrome/50">SUBTOTAL</span>
                  <span className="text-chrome">R$ {(precoBase * formData.duracao).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between border-b border-dark-700 pb-2">
                  <span className="text-chrome/50">TAXA PLATAFORMA (7%)</span>
                  <span className="text-chrome">R$ {(taxaPlataforma * formData.duracao).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-chrome font-bold">TOTAL</span>
                  <span className="text-neon-acid font-bold text-lg">
                    R$ {(valorTotal * formData.duracao).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-neon-cyan/30 bg-neon-cyan/5 p-4">
            <h4 className="font-mono font-bold text-neon-cyan text-xs uppercase tracking-wider mb-2">
              [INFO] REGRAS IMPORTANTES
            </h4>
            <ul className="text-xs font-mono text-neon-cyan/80 space-y-1">
              <li>- Pagamento retido ate 48h apos o evento</li>
              <li>- Distancia &gt;200km requer 50% de adiantamento</li>
              <li>- Chat disponivel apos aceitacao do booking</li>
            </ul>
          </div>

          <button className="w-full px-6 py-4 border-2 border-neon-red bg-neon-red text-dark-950 font-mono font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,0,68,0.5)] transition-all">
            ENVIAR SOLICITACAO
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBooking;
