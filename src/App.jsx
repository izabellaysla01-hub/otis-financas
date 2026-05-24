import React, { useState, useEffect, useRef } from 'react';
import './style.css';

// Seus dados reais do print do Firebase já injetados aqui!
const firebaseConfig = {
  apiKey: "AIzaSyAugQfX81kwXcFR3fhcCy6PLIiw",
  authDomain: "otis-financas.firebaseapp.com",
  projectId: "otis-financas",
  storageBucket: "otis-financas.firebasestorage.app",
  messagingSenderId: "884031738300",
  appId: "1:884031738300:web:74ae1d953ad4b7"
};

export default function App() {
  const [step, setStep] = useState(4); // Entra direto no painel para facilitar no celular
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  
  const [ganhos, setGanhos] = useState(() => parseFloat(localStorage.getItem('otis_ganhos')) || 5000.00);
  const [editandoGanhos, setEditandoGanhos] = useState(false);
  const [novoGanhoInput, setNovoGanhoInput] = useState(ganhos.toString());

  const [despesasFixas, setDespesasFixas] = useState(() => {
    const salvas = localStorage.getItem('otis_fixas');
    return salvas ? JSON.parse(salvas) : [
      { id: 1, descricao: 'Internet Alis', valor: 99.90, vencimento: 10, pago: false },
      { id: 2, descricao: 'Netflix', valor: 55.90, vencimento: 15, pago: true },
      { id: 3, descricao: 'Conta de Luz', valor: 180.00, vencimento: 20, pago: false }
    ];
  });

  const [novaFixa, setNovaFixa] = useState({ descricao: '', valor: '', vencimento: '' });
  const [editandoFixaId, setEditandoFixaId] = useState(null);

  const [despesasVariaveis, setDespesasVariaveis] = useState(() => {
    const salvas = localStorage.getItem('otis_variaveis');
    return salvas ? JSON.parse(salvas) : [];
  });

  const [mensagens, setMensagens] = useState([
    { id: 1, remetente: 'app', texto: 'Oi! Eu sou o Otis. Digite o que gastou e a categoria (ex: "Remédio R$ 10 Saúde" ou "Uber R$ 15") para eu organizar tudo!' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { localStorage.setItem('otis_ganhos', ganhos); }, [ganhos]);
  useEffect(() => { localStorage.setItem('otis_fixas', JSON.stringify(despesasFixas)); }, [despesasFixas]);
  useEffect(() => { localStorage.setItem('otis_variaveis', JSON.stringify(despesasVariaveis)); }, [despesasVariaveis]);
  useEffect(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  const totalFixas = despesasFixas.reduce((acc, curr) => acc + curr.valor, 0);
  const totalVariaveis = despesasVariaveis.reduce((acc, curr) => acc + curr.valor, 0);
  const valorSobrelante = ganhos - totalFixas - totalVariaveis;

  const categoriasValidas = ['Saúde', 'Lazer', 'Mercado', 'Transporte', 'Beleza', 'Estudo', 'Outros'];

  const totaisPorCategoria = categoriasValidas.reduce((acc, cat) => {
    acc[cat] = despesasVariaveis.filter(d => d.categoria === cat).reduce((sum, d) => sum + d.valor, 0);
    return acc;
  }, {});

  const enviarMensagemChat = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textoUsuario = inputText;
    setMensagens(prev => [...prev, { id: Date.now(), remetente: 'usuario', texto: textoUsuario }]);
    setInputText('');

    const numerosEncontrados = textoUsuario.match(/\d+([.,]\d+)?/);
    
    setTimeout(() => {
      if (numerosEncontrados) {
        const valorGasto = parseFloat(numerosEncontrados[0].replace(',', '.'));
        let categoriaDetectada = 'Outros';
        const txtLower = textoUsuario.toLowerCase();
        
        if (txtLower.includes('saude') || txtLower.includes('remedio') || txtLower.includes('farmacia') || txtLower.includes('remédio')) categoriaDetectada = 'Saúde';
        else if (txtLower.includes('lazer') || txtLower.includes('cinema') || txtLower.includes('show') || txtLower.includes('ifood') || txtLower.includes('festa')) categoriaDetectada = 'Lazer';
        else if (txtLower.includes('mercado') || txtLower.includes('compras') || txtLower.includes('feira')) categoriaDetectada = 'Mercado';
        else if (txtLower.includes('transporte') || txtLower.includes('uber') || txtLower.includes('onibus') || txtLower.includes('gasolina') || txtLower.includes('ônibus')) categoriaDetectada = 'Transporte';
        else if (txtLower.includes('beleza') || txtLower.includes('salao') || txtLower.includes('cabelo') || txtLower.includes('unha') || txtLower.includes('salão')) categoriaDetectada = 'Beleza';
        else if (txtLower.includes('estudo') || txtLower.includes('curso') || txtLower.includes('livro') || txtLower.includes('faculdade')) categoriaDetectada = 'Estudo';

        const novoGasto = {
          id: Date.now(),
          descricao: textoUsuario.replace(/[R$]*\d+([.,]\d+)?/, '').replace(new RegExp(categoriaDetectada, 'gi'), '').trim() || 'Gasto no Chat',
          valor: valorGasto,
          categoria: categoriaDetectada,
          data: '24/05/2026'
        };

        setDespesasVariaveis(prev => [...prev, novoGasto]);

        setMensagens(prev => [...prev, {
          id: Date.now() + 1,
          remetente: 'app',
          texto: `Vou registrar isso para você agora!\nFeito, Izabella!\n• ${novoGasto.descricao} - R$ ${valorGasto.toFixed(2)}\n• Categoria: ${categoriaDetectada}\n• Data: hoje, 24/05/2026`
        }]);
      } else {
        setMensagens(prev => [...prev, { id: Date.now() + 1, remetente: 'app', texto: 'Não consegui identificar o valor. Tente digitar por exemplo: "Remédio R$ 10"' }]);
      }
    }, 500);
  };

  return (
    <div className="container-app">
      <div className="conteudo-aba">
        
        {abaAtiva === 'inicio' && (
          <div className="space-aba">
            <div className="card-sobrelante">
              <p className="label-card">VALOR SOBRELANTE LIVRE</p>
              <h2 className="valor-destaque">R$ {valorSobrelante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              <p className="desc-card">O que sobra real após as contas fixas e gastos do chat.</p>
            </div>

            <div className="grid-resumos">
              <div className="mini-card">
                <span className="mini-label">Ganhos do Mês ✏️</span>
                {editandoGanhos ? (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <input type="number" value={novoGanhoInput} onChange={(e) => setNovoGanhoInput(e.target.value)} className="input-custom" style={{ padding: '4px' }} />
                    <button onClick={() => { setGanhos(parseFloat(novoGanhoInput)); setEditandoGanhos(false); }} className="btn-laranja" style={{ width: '40px', padding: '4px' }}>✓</button>
                  </div>
                ) : (
                  <p className="mini-valor text-verde" onClick={() => setEditandoGanhos(true)}>R$ {ganhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                )}
              </div>
              <div className="mini-card">
                <span className="mini-label">Comprometido Total</span>
                <p className="mini-valor text-laranja">R$ {(totalFixas + totalVariaveis).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bloco-lista">
              <h3 className="titulo-secao">Gastos do dia a dia (Chat)</h3>
              <div className="lista-contas">
                {despesasVariaveis.map(g => (
                  <div key={g.id} className="item-conta-painel">
                    <div>
                      <p className="item-nome">• {g.descricao}</p>
                      <p className="item-venc">Categoria: {g.categoria} • {g.data}</p>
                    </div>
                    <div className="flex-actions">
                      <span className="item-valor text-laranja" onClick={() => {
                        const nv = parseFloat(prompt("Alterar valor para:", g.valor));
                        if(nv) setDespesasVariaveis(despesasVariaveis.map(d => d.id === g.id ? {...d, valor: nv} : d));
                      }}>R$ {g.valor.toFixed(2)} ✏️</span>
                      <button className="btn-del" onClick={() => setDespesasVariaveis(despesasVariaveis.filter(d => d.id !== g.id))}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'fixas' && (
          <div className="space-aba">
            <h2 className="subtitulo">Contas Fixas</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!novaFixa.descricao || !novaFixa.valor) return;
              if(editandoFixaId) {
                setDespesasFixas(despesasFixas.map(f => f.id === editandoFixaId ? {...f, descricao: novaFixa.descricao, valor: parseFloat(novaFixa.valor), vencimento: parseInt(novaFixa.vencimento)} : f));
                setEditandoFixaId(null);
              } else {
                setDespesasFixas([...despesasFixas, { id: Date.now(), descricao: novaFixa.descricao, valor: parseFloat(novaFixa.valor), vencimento: parseInt(novaFixa.vencimento) || 1, pago: false }]);
              }
              setNovaFixa({ descricao: '', valor: '', vencimento: '' });
            }} className="grupo-inputs bg-box">
              <input type="text" placeholder="Nome da Conta" value={novaFixa.descricao} onChange={(e) => setNovaFixa({...novaFixa, descricao: e.target.value})} className="input-custom" />
              <input type="number" placeholder="Valor (R$)" value={novaFixa.valor} onChange={(e) => setNovaFixa({...novaFixa, valor: e.target.value})} className="input-custom" />
              <input type="number" placeholder="Vencimento (Dia)" value={novaFixa.vencimento} onChange={(e) => setNovaFixa({...novaFixa, vencimento: e.target.value})} className="input-custom" />
              <button type="submit" className="btn-laranja">{editandoFixaId ? 'Salvar Alteração' : 'Adicionar Conta'}</button>
            </form>

            <div className="lista-contas m-top">
              {despesasFixas.map(f => (
                <div key={f.id} className="item-conta-painel">
                  <div onClick={() => setDespesasFixas(despesasFixas.map(item => item.id === f.id ? {...item, pago: !item.pago} : item))}>
                    <p className="item-nome" style={{ textDecoration: f.pago ? 'line-through' : 'none' }}>{f.descricao}</p>
                    <p className="item-venc">Vence dia {f.vencimento} • {f.pago ? '✅ Pago' : '⏳ Pendente'}</p>
                  </div>
                  <div className="flex-actions">
                    <span className="item-valor">R$ {f.valor.toFixed(2)}</span>
                    <button className="btn-edit" onClick={() => { setEditandoFixaId(f.id); setNovaFixa({ descricao: f.descricao, valor: f.valor.toString(), vencimento: f.vencimento.toString() }); }}>✏️</button>
                    <button className="btn-del" onClick={() => setDespesasFixas(despesasFixas.filter(item => item.id !== f.id))}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'visao' && (
          <div className="space-aba">
            <h2 className="subtitulo">Visão</h2>
            
            <div className="card-grafico-mock">
              <div className="circulo-grafico">
                <span className="total-grafico">R$ {totalVariaveis.toFixed(2)}</span>
                <span className="label-grafico">Total do Mês</span>
              </div>
            </div>

            <div className="lista-categorias-visao">
              {categoriasValidas.map(cat => {
                const valor = totaisPorCategoria[cat] || 0;
                const percentual = totalVariaveis > 0 ? (valor / totalVariaveis) * 100 : 0;
                return (
                  <div key={cat} className="item-categoria-visao">
                    <div className="barra-progresso-bg">
                      <div className="barra-progresso-fill" style={{ width: `${percentual}%` }}></div>
                      <div className="categoria-info-overlay">
                        <span className="cat-nome">{cat}</span>
                        <span className="cat-valor">R$ {valor.toFixed(2)} ({percentual.toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {abaAtiva === 'chat' && (
          <div className="container-chat-real">
            <div className="historico-mensagens">
              {mensagens.map(m => (
                <div key={m.id} className={`wrapper-mensagem ${m.remetente}`}>
                  <div className={`balao-mensagem ${m.remetente}`}>
                    {m.texto.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={enviarMensagemChat} className="form-input-chat">
              <input type="text" placeholder="Fale com o Otis..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="input-chat" />
              <button type="submit" className="btn-enviar-chat">➔</button>
            </form>
          </div>
        )}

      </div>

      <nav className="menu-flutuante">
        <button onClick={() => setAbaAtiva('inicio')} className={`btn-menu-item ${abaAtiva === 'inicio' ? 'ativo' : ''}`}>🏠</button>
        <button onClick={() => setAbaAtiva('fixas')} className={`btn-menu-item ${abaAtiva === 'fixas' ? 'ativo' : ''}`}>📋</button>
        <button onClick={() => setAbaAtiva('visao')} className={`btn-menu-item ${abaAtiva === 'visao' ? 'ativo' : ''}`}>📊</button>
        <button onClick={() => setAbaAtiva('chat')} className={`btn-menu-item ${abaAtiva === 'chat' ? 'ativo' : ''}`}>💬</button>
      </nav>
    </div>
  );
}
