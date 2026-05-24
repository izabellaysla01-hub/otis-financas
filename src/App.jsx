import React, { useState, useEffect, useRef } from 'react';
import './style.css';

const firebaseConfig = {
  apiKey: "AIzaSyAugQfX81kwXcFR3fhcCy6PLIiw",
  authDomain: "otis-financas.firebaseapp.com",
  projectId: "otis-financas",
  storageBucket: "otis-financas.firebasestorage.app",
  messagingSenderId: "884031738300",
  appId: "1:884031738300:web:74ae1d953ad4b7"
};

export default function App() {
  // Guardar se o usuário está logado ou não
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    return localStorage.getItem('otis_logado') === 'true';
  });

  const [step, setStep] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  
  // Dados do Usuário e Ganhos
  const [formData, setFormData] = useState({ nome: '', sobrenome: '', nascimento: '', motivacao: '' });
  const [ganhos, setGanhos] = useState(() => parseFloat(localStorage.getItem('otis_ganhos')) || 5000.00);
  const [editandoGanhos, setEditandoGanhos] = useState(false);
  const [novoGanhoInput, setNovoGanhoInput] = useState(ganhos.toString());

  // Contas Fixas
  const [despesasFixas, setDespesasFixas] = useState(() => {
    const salvas = localStorage.getItem('otis_fixas');
    return salvas ? JSON.parse(salvas) : [
      { id: 1, descricao: 'Internet Alis', valor: 99.90, vencimento: 10, pago: false },
      { id: 2, descricao: 'Netflix', valor: 55.90, vencimento: 15, pago: true },
      { id: 3, descricao: 'Conta de Luz', valor: 180.00, vencimento: 20, pago: false }
    ];
  });

  const [formFixa, setFormFixa] = useState({ descricao: '', valor: '', vencimento: '' });
  const [editandoFixaId, setEditandoFixaId] = useState(null);

  // Gastos do Chat (Variáveis)
  const [despesasVariaveis, setDespesasVariaveis] = useState(() => {
    const salvas = localStorage.getItem('otis_variaveis');
    return salvas ? JSON.parse(salvas) : [];
  });

  const [mensagens, setMensagens] = useState([
    { id: 1, remetente: 'app', texto: 'Oi Izabella! Sou o Otis. 🦊\nDigite um gasto (ex: "Farmácia R$ 30") e eu classifico para você!' }
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

  const categorias = [
    { nome: 'Saúde', ícone: '🏥', cor: '#FF4D4D' },
    { nome: 'Lazer', ícone: '🎡', cor: '#FFD700' },
    { nome: 'Mercado', ícone: '🛒', cor: '#4CAF50' },
    { nome: 'Transporte', ícone: '🚗', cor: '#2196F3' },
    { nome: 'Beleza', ícone: '💅', cor: '#E91E63' },
    { nome: 'Estudo', ícone: '📚', cor: '#9C27B0' },
    { nome: 'Outros', ícone: '📦', cor: '#888888' }
  ];

  const avancar = () => setStep(step + 1);
  const voltar = () => setStep(step - 1);
  
  const realizarLogin = () => {
    setUsuarioLogado(true);
    localStorage.setItem('otis_logado', 'true');
  };

  const realizarLogout = () => {
    setUsuarioLogado(false);
    localStorage.setItem('otis_logado', 'false');
    setStep(1);
  };

  const enviarMensagemChat = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg = inputText;
    setMensagens(prev => [...prev, { id: Date.now(), remetente: 'usuario', texto: msg }]);
    setInputText('');

    const valorMatch = msg.match(/\d+([.,]\d+)?/);
    setTimeout(() => {
      if (valorMatch) {
        const valor = parseFloat(valorMatch[0].replace(',', '.'));
        let cat = 'Outros';
        const t = msg.toLowerCase();
        if (t.includes('saude') || t.includes('remedio') || t.includes('farmacia') || t.includes('remédio')) cat = 'Saúde';
        else if (t.includes('uber') || t.includes('onibus') || t.includes('gasolina') || t.includes('ônibus')) cat = 'Transporte';
        else if (t.includes('mercado') || t.includes('comida') || t.includes('compras')) cat = 'Mercado';
        else if (t.includes('lazer') || t.includes('ifood') || t.includes('cinema') || t.includes('festa')) cat = 'Lazer';
        else if (t.includes('salao') || t.includes('unha') || t.includes('cabelo') || t.includes('salão')) cat = 'Beleza';
        else if (t.includes('curso') || t.includes('livro') || t.includes('estudo')) cat = 'Estudo';

        const novoGasto = { id: Date.now(), descricao: msg.replace(/[R$]*\d+([.,]\d+)?/, '').trim() || 'Gasto', valor, categoria: cat, data: '24/05/2026' };
        setDespesasVariaveis(prev => [...prev, novoGasto]);
        setMensagens(prev => [...prev, { id: Date.now()+1, remetente: 'app', texto: `Vou registrar isso para você agora!\nFeito, Izabella!\n• ${novoGasto.descricao} - R$ ${valor.toFixed(2)}\n• Categoria: ${cat}\n• Data: hoje, 24/05/2026` }]);
      }
    }, 600);
  };

  return (
    <div className="container-app">
      
      {/* SE NÃO ESTIVER LOGADO: MOSTRA AS TELAS DE CADASTRO/LOGIN */}
      {!usuarioLogado ? (
        <div className="flex-cadastro">
          {step > 1 && (
            <div className="progress-bar-container">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`progress-dot ${i <= step ? 'active' : ''}`} />
              ))}
            </div>
          )}
          {step > 1 && <button onClick={voltar} className="btn-voltar">← Voltar</button>}
          
          <div className="content-box">
            {step === 1 && (
              <div className="step-content text-center">
                <div className="logo-area">
                  <div className="logo-detalhe"></div>
                  <span className="logo-texto">OTIS<span className="ponto-laranha">.</span></span>
                </div>
                <h1 className="titulo-principal">Descubra para onde está indo seu dinheiro.</h1>
                <div className="grupo-botoes">
                  <button onClick={avancar} className="btn-laranja">Criar uma conta</button>
                  <button onClick={avancar} className="btn-escuro">Logar com seu E-mail</button>
                  <div className="divisor-texto">Ou conecte com</div>
                  <button onClick={realizarLogin} className="btn-branco">Continuar com o Google</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <div className="text-center">
                  <div className="avatar-usuario">🦊</div>
                  <h2 className="subtitulo">Seus dados</h2>
                  <p className="descricao">Essas informações mantêm sua conta segura.</p>
                </div>
                <div className="grupo-inputs">
                  <input type="text" placeholder="Nome" className="input-custom" />
                  <input type="text" placeholder="Sobrenome" className="input-custom" />
                  <input type="text" placeholder="Data de nascimento" className="input-custom" />
                </div>
                <button onClick={avancar} className="btn-laranja m-top">Continuar</button>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <div>
                  <h2 className="subtitulo">Qual sua maior motivação?</h2>
                  <p className="descricao">Selecione suas prioridades financeiras.</p>
                </div>
                <div className="grupo-botoes">
                  {["Controlar meus gastos do dia a dia", "Ver meu valor sobrelante livre", "Acompanhar parcelamentos futuros", "Não esquecer das minhas contas fixas"].map((opcao) => (
                    <button key={opcao} onClick={() => setFormData({...formData, motivacao: opcao})} className={`btn-opcao ${formData.motivacao === opcao ? 'opcao-ativa' : ''}`}>{opcao}</button>
                  ))}
                </div>
                <button onClick={realizarLogin} className="btn-branco m-top">Finalizar e Entrar</button>
              </div>
            )}
          </div>
          <div className="footer-seguranca">Dados protegidos com criptografia.</div>
        </div>
      ) : (
        
        /* SE ESTIVER LOGADO: ENTRA NO PAINEL PRINCIPAL */
        <div className="main-scroll">
          
          {abaAtiva === 'inicio' && (
            <div className="page">
              <div className="top-header">
                <span className="user-greet">Olá, Izabella 👋</span>
                {/* Botão de sair que adicionamos aqui para voltar às telas iniciais */}
                <button className="btn-logout" onClick={realizarLogout}>Sair 🚪</button>
              </div>

              <div className="card-sobrelante">
                <span className="label">VALOR SOBRELANTE LIVRE</span>
                <h1 className="valor-main">R$ {valorSobrelante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h1>
                <p className="sub">O que sobra real após contas fixas e gastos do chat.</p>
              </div>

              <div className="row-cards">
                <div className="mini-card" onClick={() => setEditandoGanhos(true)}>
                  <span className="mini-label">Ganhos do Mês ✏️</span>
                  {editandoGanhos ? (
                    <input type="number" className="edit-input" defaultValue={ganhos} autoFocus onBlur={(e) => { if(e.target.value) setGanhos(parseFloat(e.target.value)); setEditandoGanhos(false); }} />
                  ) : (
                    <span className="mini-val text-verde">R$ {ganhos.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                  )}
                </div>
                <div className="mini-card">
                  <span className="mini-label">Comprometido</span>
                  <span className="mini-val text-laranja">R$ {(totalFixas+totalVariaveis).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="section">
                <h3 className="section-title">Status das Contas Fixas</h3>
                {despesasFixas.map(f => (
                  <div key={f.id} className="item-row">
                    <div className="dot" style={{ background: f.pago ? '#00cc66' : '#ff3333' }}></div>
                    <div className="info" onClick={() => setDespesasFixas(despesasFixas.map(i => i.id === f.id ? {...i, pago: !i.pago} : i))}>
                      <p className="name">{f.descricao}</p>
                      <p className="date">Vence dia {f.vencimento} • {f.pago ? 'Pago' : 'Pendente'}</p>
                    </div>
                    <span className="val">R$ {f.valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {abaAtiva === 'fixas' && (
            <div className="page">
              <h2 className="title">Gerenciar Fixas</h2>
              <div className="form-box">
                <input type="text" placeholder="Nome da Conta" value={formFixa.descricao} onChange={e => setFormFixa({...formFixa, descricao: e.target.value})} />
                <input type="number" placeholder="Valor (R$)" value={formFixa.valor} onChange={e => setFormFixa({...formFixa, valor: e.target.value})} />
                <button className="btn-add" onClick={() => {
                  if(!formFixa.descricao || !formFixa.valor) return;
                  if(editandoFixaId) {
                    setDespesasFixas(despesasFixas.map(f => f.id === editandoFixaId ? {...f, descricao: formFixa.descricao, valor: parseFloat(formFixa.valor)} : f));
                    setEditandoFixaId(null);
                  } else {
                    setDespesasFixas([...despesasFixas, { id: Date.now(), descricao: formFixa.descricao, valor: parseFloat(formFixa.valor), vencimento: 10, pago: false }]);
                  }
                  setFormFixa({descricao: '', valor: '', vencimento: ''});
                }}>{editandoFixaId ? 'Salvar Alteração' : 'Adicionar Conta'}</button>
              </div>
              <div className="section">
                {despesasFixas.map(f => (
                  <div key={f.id} className="item-row">
                    <div className="info">
                      <p className="name">{f.descricao}</p>
                      <p className="val-small">R$ {f.valor.toFixed(2)}</p>
                    </div>
                    <div className="actions">
                      <button onClick={() => { setEditandoFixaId(f.id); setFormFixa({descricao: f.descricao, valor: f.valor.toString()}); }}>✏️</button>
                      <button onClick={() => setDespesasFixas(despesasFixas.filter(i => i.id !== f.id))}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {abaAtiva === 'visao' && (
            <div className="page">
              <h2 className="title">Visão</h2>
              <div className="vision-summary">
                <div className="circle-progress">
                  <span className="total-num">R$ {totalVariaveis.toFixed(0)}</span>
                  <span className="total-lab">Gasto Chat</span>
                </div>
              </div>
              <div className="vision-list">
                {categorias.map(cat => {
                  const totalCat = despesasVariaveis.filter(d => d.categoria === cat.nome).reduce((s, d) => s + d.valor, 0);
                  const perc = totalVariaveis > 0 ? (totalCat / totalVariaveis) * 100 : 0;
                  return (
                    <div key={cat.nome} className="vision-item">
                      <div className="vision-info">
                        <span>{cat.ícone} {cat.nome}</span>
                        <span>R$ {totalCat.toFixed(2)}</span>
                      </div>
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${perc}%`, background: cat.cor }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {abaAtiva === 'chat' && (
            <div className="chat-container">
              <div className="chat-messages">
                {mensagens.map(m => (
                  <div key={m.id} className={`bubble ${m.remetente}`}>
                    {m.texto.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input-area" onSubmit={enviarMensagemChat}>
                <input type="text" placeholder="Fale com o Otis..." value={inputText} onChange={e => setInputText(e.target.value)} />
                <button type="submit">➔</button>
              </form>
            </div>
          )}

          <nav className="nav-floating">
            <button className={abaAtiva === 'inicio' ? 'active' : ''} onClick={() => setAbaAtiva('inicio')}>🏠</button>
            <button className={abaAtiva === 'fixas' ? 'active' : ''} onClick={() => setAbaAtiva('fixas')}>📋</button>
            <button className={abaAtiva === 'visao' ? 'active' : ''} onClick={() => setAbaAtiva('visao')}>📊</button>
            <button className={abaAtiva === 'chat' ? 'active' : ''} onClick={() => setAbaAtiva('chat')}>💬</button>
          </nav>
        </div>
      )}
    </div>
  );
}
