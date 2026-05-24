import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import './style.css';

// Suas credenciais oficiais e completas do Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyAugQfX81kwXcFR3fhcCy6PLIiw8tqhT1w",
  authDomain: "otis-financas.firebaseapp.com",
  projectId: "otis-financas",
  storageBucket: "otis-financas.firebasestorage.app",
  messagingSenderId: "884031738300",
  appId: "1:884031738300:web:74ae1d953ad4b7bcc21bb9"
};

// Inicializa o Firebase com segurança
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  const [carregando, setCarregando] = useState(false);

  // Formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');

  // Estados Financeiros
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

  const [formFixa, setFormFixa] = useState({ descricao: '', valor: '' });
  const [editandoFixaId, setEditandoFixaId] = useState(null);
  const [despesasVariaveis, setDespesasVariaveis] = useState(() => {
    const salvas = localStorage.getItem('otis_variaveis');
    return salvas ? JSON.parse(salvas) : [];
  });

  const [mensagens, setMensagens] = useState([
    { id: 1, remetente: 'app', texto: 'Oi Izabella! Sou o Otis. 🦊\nDigite um gasto (ex: "Farmácia R$ 30") e eu organizo nas suas categorias da Visão!' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Monitora autenticação real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioLogado(true);
        setUserEmail(user.email);
      } else {
        setUsuarioLogado(false);
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);

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

  const criarContaFirebase = async () => {
    if (!email || !senha) return alert('Preencha e-mail e senha!');
    setCarregando(true);
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert('Conta criada com sucesso de verdade!');
    } catch (error) {
      alert('Erro ao criar conta: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const logarFirebase = async () => {
    if (!email || !senha) return alert('Preencha e-mail e senha!');
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert('Logado com sucesso!');
    } catch (error) {
      alert('Erro ao entrar: ' + error.message);
    } finally {
      setCarregando(false);
    }
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
        setMensagens(prev => [...prev, { id: Date.now()+1, remetente: 'app', texto: `Vou registrar isso para você agora!\nFeito!\n• ${novoGasto.descricao} - R$ ${valor.toFixed(2)}\n• Categoria: ${cat}\n• Data: hoje, 24/05/2026` }]);
      }
    }, 500);
  };

  return (
    <div className="container-app">
      {carregando && <div className="loading-overlay">Carregando no Firebase...</div>}

      {!usuarioLogado ? (
        <div className="flex-cadastro">
          {step > 1 && <button onClick={() => setStep(1)} className="btn-voltar">← Voltar</button>}
          
          <div className="content-box">
            {step === 1 && (
              <div className="text-center-box">
                <div className="logo-area">
                  <div className="logo-detalhe"></div>
                  <span className="logo-texto">OTIS<span className="ponto-laranha">.</span></span>
                </div>
                <h1 className="titulo-principal">Descubra para onde está indo seu dinheiro.</h1>
                <div className="grupo-botoes">
                  <button onClick={() => setStep(2)} className="btn-laranja">Criar uma conta</button>
                  <button onClick={() => setStep(3)} className="btn-escuro">Entrar com seu E-mail</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <h2 className="subtitulo">Criar sua Conta</h2>
                <p className="descricao">Digite seus dados de acesso.</p>
                <div className="grupo-inputs">
                  <input type="text" placeholder="Seu Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="input-custom" />
                  <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="input-custom" />
                  <input type="password" placeholder="Senha (mínimo 6 dígitos)" value={senha} onChange={(e) => setSenha(e.target.value)} className="input-custom" />
                </div>
                <button onClick={criarContaFirebase} className="btn-laranja m-top">Cadastrar de Verdade</button>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <h2 className="subtitulo">Entrar no Otis</h2>
                <p className="descricao">Insira seu e-mail e senha cadastrados.</p>
                <div className="grupo-inputs">
                  <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="input-custom" />
                  <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="input-custom" />
                </div>
                <button onClick={logarFirebase} className="btn-laranja m-top">Fazer Login</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="app-logado">
          <div className="main-scroll">
            
            {abaAtiva === 'inicio' && (
              <div className="page">
                <div className="top-header">
                  <span className="user-greet">{userEmail} ✨</span>
                  <button className="btn-logout" onClick={() => signOut(auth)}>Sair 🚪</button>
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
                      <span className="mini-val text-verde">R$ {ganhos.toLocaleString('pt-BR')}</span>
                    )}
                  </div>
                  <div className="mini-card">
                    <span className="mini-label">Comprometido</span>
                    <span className="mini-val text-laranja">R$ {(totalFixas+totalVariaveis).toLocaleString('pt-BR')}</span>
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

                <div className="section" style={{ marginTop: '20px' }}>
                  <h3 className="section-title">Gastos do dia a dia (Chat)</h3>
                  {despesasVariaveis.length === 0 ? <p style={{ color: '#444', fontSize: '13px' }}>Nenhum gasto lançado.</p> : despesasVariaveis.map(g => (
                    <div key={g.id} className="item-row">
                      <div className="info">
                        <p className="name">{g.descricao || 'Gasto'}</p>
                        <p className="date">{g.categoria} • 24/05/2026</p>
                      </div>
                      <span className="val text-laranja" style={{ marginRight: '10px' }}>R$ {g.valor.toFixed(2)}</span>
                      <button style={{ background: 'none', border: 'none', color: '#ff3333', cursor: 'pointer' }} onClick={() => setDespesasVariaveis(despesasVariaveis.filter(i => i.id !== g.id))}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'fixas' && (
              <div className="page">
                <h2 className="title">Gerenciar Fixas</h2>
                <div className="form-box">
                  <input type="text" placeholder="Nome da Conta" value={formFixa.descricao} onChange={e => setFormFixa({...formFixa, descricao: e.target.value})} className="input-custom" />
                  <input type="number" placeholder="Valor (R$)" value={formFixa.valor} onChange={e => setFormFixa({...formFixa, valor: e.target.value})} className="input-custom" />
                  <button className="btn-laranja" onClick={() => {
                    if(!formFixa.descricao || !formFixa.valor) return;
                    setDespesasFixas([...despesasFixas, { id: Date.now(), descricao: formFixa.descricao, valor: parseFloat(formFixa.valor), vencimento: 10, pago: false }]);
                    setFormFixa({descricao: '', valor: ''});
                  }}>Adicionar Conta</button>
                </div>
                <div className="section">
                  {despesasFixas.map(f => (
                    <div key={f.id} className="item-row">
                      <div className="info">
                        <p className="name">{f.descricao}</p>
                        <p className="date">R$ {f.valor.toFixed(2)}</p>
                      </div>
                      <button onClick={() => setDespesasFixas(despesasFixas.filter(i => i.id !== f.id))} style={{ background: 'none', border: 'none', color: '#ff3333' }}>🗑️</button>
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
                    <span className="total-num">R$ {totalVariaveis.toFixed(2)}</span>
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
                          <span>R$ {totalCat.toFixed(2)} ({perc.toFixed(0)}%)</span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{ width: `${perc || 0}%`, background: cat.cor }}></div>
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

          </div>

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
