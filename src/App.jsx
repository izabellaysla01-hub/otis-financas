import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword
} from 'firebase/auth';
import './style.css';

const firebaseConfig = {
  apiKey: "AIzaSyAugQfX81kwXcFR3fhcCy6PLIiw8tqhT1w",
  authDomain: "otis-financas.firebaseapp.com",
  projectId: "otis-financas",
  storageBucket: "otis-financas.firebasestorage.app",
  messagingSenderId: "884031738300",
  appId: "1:884031738300:web:74ae1d953ad4b7bcc21bb9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  const [subAbaVision, setSubAbaVision] = useState('categorias');
  const [carregando, setCarregando] = useState(false);
  const [comprometidoAberto, setComprometidoAberto] = useState(false);

  // Sistema de Data com seletor espaçado e centralizado
  const [dataFiltro, setDataFiltro] = useState(new Date()); 
  
  const obterMesAnoTexto = (date) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };
  
  const mesAnoChave = `${dataFiltro.getMonth() + 1}-${dataFiltro.getFullYear()}`;

  // Perfil e Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState(() => localStorage.getItem('otis_nome') || '');
  const [novaSenha, setNovaSenha] = useState('');

  // Financeiro Dinâmico
  const [ganhosMensais, setGanhosMensais] = useState(() => {
    const salvos = localStorage.getItem('otis_ganhos_meses');
    return salvos ? JSON.parse(salvos) : {};
  });
  const [editandoGanhos, setEditandoGanhos] = useState(false);

  // Categorias Dinâmicas
  const [categorias, setCategorias] = useState(() => {
    const salvas = localStorage.getItem('otis_categorias');
    return salvas ? JSON.parse(salvas) : [
      { nome: 'Saúde', ícone: '🏥', cor: '#FF4D4D' },
      { nome: 'Lazer', ícone: '🎡', cor: '#FFD700' },
      { nome: 'Mercado', ícone: '🛒', cor: '#4CAF50' },
      { nome: 'Transporte', ícone: '🚗', cor: '#2196F3' },
      { nome: 'Beleza', ícone: '💅', cor: '#E91E63' },
      { nome: 'Estudo', ícone: '📚', cor: '#9C27B0' },
      { nome: 'Outros', ícone: '📦', cor: '#888888' }
    ];
  });
  const [novaCatNome, setNovaCatNome] = useState('');

  // Contas Fixas Globais
  const [despesasFixas, setDespesasFixas] = useState(() => {
    const salvas = localStorage.getItem('otis_fixas');
    return salvas ? JSON.parse(salvas) : [];
  });
  const [formFixa, setFormFixa] = useState({ descricao: '', valor: '', vencimento: '' });
  const [editandoFixaId, setEditandoFixaId] = useState(null);

  const [historicoPagosFixas, setHistoricoPagosFixas] = useState(() => {
    const salvos = localStorage.getItem('otis_fixas_pagas_meses');
    return salvos ? JSON.parse(salvos) : {};
  });

  // Assinaturas e Parcelamentos
  const [assinaturas, setAssinaturas] = useState(() => {
    const salvas = localStorage.getItem('otis_assinaturas');
    return salvas ? JSON.parse(salvas) : [];
  });
  const [formAssinatura, setFormAssinatura] = useState({ nome: '', valor: '' });
  const [editandoAssinaturaId, setEditandoAssuraId] = useState(null);

  const [parcelamentos, setParcelamentos] = useState(() => {
    const salvos = localStorage.getItem('otis_parcelamentos');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [formParcela, setFormParcela] = useState({ nome: '', valor: '', atual: '', total: '' });
  const [editandoParcelaId, setEditandoParcelaId] = useState(null);

  const [despesasVariaveis, setDespesasVariaveis] = useState(() => {
    const salvas = localStorage.getItem('otis_variaveis');
    return salvas ? JSON.parse(salvas) : [];
  });

  const [mensagens, setMensagens] = useState([
    { id: 1, remetente: 'app', texto: 'Oi! Sou o Otis. 🦊\nDigite seus gastos diários aqui (ex: "farmácia 20") e eu organizo tudo automaticamente!' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioLogado(true);
        setUserEmail(user.email);
        if (!nome) {
          const nomeExt = user.email.split('@')[0];
          setNome(nomeExt.charAt(0).toUpperCase() + nomeExt.slice(1));
        }
      } else { setUsuarioLogado(false); }
    });
    return () => unsubscribe();
  }, [nome]);

  useEffect(() => { 
    localStorage.setItem('otis_ganhos_meses', JSON.stringify(ganhosMensais));
    localStorage.setItem('otis_nome', nome);
    localStorage.setItem('otis_fixas', JSON.stringify(despesasFixas));
    localStorage.setItem('otis_fixas_pagas_meses', JSON.stringify(historicoPagosFixas));
    localStorage.setItem('otis_variaveis', JSON.stringify(despesasVariaveis));
    localStorage.setItem('otis_categorias', JSON.stringify(categorias));
    localStorage.setItem('otis_assinaturas', JSON.stringify(assinaturas));
    localStorage.setItem('otis_parcelamentos', JSON.stringify(parcelamentos));
  }, [ganhosMensais, nome, despesasFixas, historicoPagosFixas, despesasVariaveis, categorias, assinaturas, parcelamentos]);

  useEffect(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  const ganhosDoMesAtual = ganhosMensais[mesAnoChave] || 0;
  const variaveisDoMes = despesasVariaveis.filter(d => d.mesAno === mesAnoChave);

  const totalFixas = despesasFixas.reduce((acc, curr) => acc + curr.valor, 0);
  const totalVariaveis = variaveisDoMes.reduce((acc, curr) => acc + curr.valor, 0);
  const totalAssinaturas = assinaturas.reduce((acc, curr) => acc + curr.valor, 0);
  const totalParcelas = parcelamentos.reduce((acc, curr) => acc + curr.valor, 0);
  
  const comprometidoTotal = totalFixas + totalVariaveis + totalAssinaturas + totalParcelas;
  const valorSobrelante = ganhosDoMesAtual - comprometidoTotal;
  const percSobra = ganhosDoMesAtual > 0 ? (valorSobrelante / ganhosDoMesAtual) * 100 : 0;

  const totaisPorCategoria = categorias.reduce((acc, cat) => {
    acc[cat.nome] = variaveisDoMes.filter(d => d.categoria === cat.nome).reduce((sum, d) => sum + d.valor, 0);
    return acc;
  }, {});

  const navegarMes = (direcao) => {
    const novaData = new Date(dataFiltro);
    novaData.setMonth(novaData.getMonth() + direcao);
    setDataFiltro(novaData);
  };

  const criarContaFirebase = async () => {
    if (!email || !senha) return alert('Preencha e-mail e senha!');
    setCarregando(true);
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      localStorage.setItem('otis_nome', nome);
      alert('Conta criada com sucesso!');
    } catch (error) { alert(error.message); } finally { setCarregando(false); }
  };

  const logarFirebase = async () => {
    if (!email || !senha) return alert('Preencha e-mail e senha!');
    setCarregando(true);
    try { await signInWithEmailAndPassword(auth, email, senha); } catch (error) { alert(error.message); } finally { setCarregando(false); }
  };

  const alterarSenhaReal = async (e) => {
    e.preventDefault();
    if(!novaSenha || novaSenha.length < 6) return alert('A senha precisa de no mínimo 6 dígitos.');
    setCarregando(true);
    try {
      if(auth.currentUser) {
        await updatePassword(auth.currentUser, novaSenha);
        alert('Senha alterada com sucesso!');
        setNovaSenha('');
      }
    } catch(error) { alert(error.message); } finally { setCarregando(false); }
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
        const t = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (t.includes('saude') || t.includes('remedio') || t.includes('farmacia')) cat = 'Saúde';
        else if (t.includes('uber') || t.includes('onibus') || t.includes('gasolina') || t.includes('transporte')) cat = 'Transporte';
        else if (t.includes('mercado') || t.includes('comida') || t.includes('compras') || t.includes('feira')) cat = 'Mercado';
        else if (t.includes('lazer') || t.includes('ifood') || t.includes('cinema') || t.includes('festa') || t.includes('show')) cat = 'Lazer';
        else if (t.includes('salao') || t.includes('unha') || t.includes('cabelo') || t.includes('beleza')) cat = 'Beleza';
        else if (t.includes('curso') || t.includes('livro') || t.includes('estudo') || t.includes('faculdade')) cat = 'Estudo';
        else {
          const encontrada = categorias.find(c => t.includes(c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
          if (encontrada) cat = encontrada.nome;
        }

        let descricaoLimpa = msg.replace(/[R$]*\d+([.,]\d+)?/, '').replace(/(reais|real|reais com|gastei|com|gasto)/gi, '').trim();
        if (!descricaoLimpa) descricaoLimpa = cat;
        descricaoLimpa = descricaoLimpa.charAt(0).toUpperCase() + descricaoLimpa.slice(1);

        const novoGasto = { 
          id: Date.now(), 
          descricao: descricaoLimpa, 
          valor, 
          categoria: cat, 
          mesAno: mesAnoChave, 
          data: new Date().toLocaleDateString('pt-BR')
        };
        setDespesasVariaveis(prev => [...prev, novoGasto]);
        
        setMensagens(prev => [...prev, { 
          id: Date.now()+1, 
          remetente: 'app', 
          texto: `Gasto salvo no histórico de ${obterMesAnoTexto(dataFiltro)}!\nFeito, ${nome || 'Izabella'}!\n• ${novoGasto.descricao} - R$ ${valor.toFixed(2)}\n• Categoria: ${cat}` 
        }]);
      }
    }, 400);
  };

  return (
    <div className="container-app">
      {carregando && <div className="loading-overlay">Carregando...</div>}

      {!usuarioLogado ? (
        <div className="flex-cadastro">
          {step > 1 && <button onClick={() => setStep(1)} className="btn-voltar">← Voltar</button>}
          <div className="content-box">
            
            {step === 1 && (
              <div className="text-center-box">
                <div className="logo-area"><div className="logo-detalhe"></div><span className="logo-texto">OTIS<span className="ponto-laranha">.</span></span></div>
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
                <div className="grupo-inputs">
                  <input type="text" placeholder="Seu Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="input-custom-dark" />
                  <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="input-custom-dark" />
                  <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="input-custom-dark" />
                </div>
                <button onClick={criarContaFirebase} className="btn-laranja m-top">Cadastrar de Verdade</button>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <h2 className="subtitulo">Entrar no Otis</h2>
                <div className="grupo-inputs">
                  <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="input-custom-dark" />
                  <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="input-custom-dark" />
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
                {/* CABEÇALHO ALINHADO SEM MÃOZINHA EMBAIXO DO NADA */}
                <div className="top-header">
                  <span className="user-greet">Olá, {nome || 'Usuário'}</span>
                  <button className="btn-logout" onClick={() => signOut(auth)}>Sair 🚪</button>
                </div>

                <div className="calendar-box-center">
                  <button className="btn-arrow-cal" onClick={() => navegarMes(-1)}>‹</button>
                  <span className="text-date-cal">{obterMesAnoTexto(dataFiltro)}</span>
                  <button className="btn-arrow-cal" onClick={() => navegarMes(1)}>›</button>
                </div>

                <div className="card-sobrelante">
                  <span className="label">VALOR SOBRELANTE LIVRE</span>
                  <h1 className="valor-main">R$ {valorSobrelante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h1>
                  <div className="dash-bar-bg" style={{ background: 'rgba(0,0,0,0.2)', border: 'none', marginTop: '12px' }}>
                    <div className="dash-bar-fill" style={{ width: `${Math.max(0, Math.min(percSobra, 100))}%`, background: '#fff' }}></div>
                  </div>
                </div>

                <div className="mini-card-ganho" onClick={() => setEditandoGanhos(true)}>
                  <div className="dash-bar-info">
                    {/* FONTE MAIOR AJUSTADA AQUI */}
                    <span className="dash-bar-label font-destaque-ganho">Ganhos de {obterMesAnoTexto(dataFiltro)} ✏️</span>
                    <span className="dash-bar-value text-verde">R$ {ganhosDoMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {editandoGanhos && (
                    <input type="number" className="edit-input-dash" defaultValue={ganhosDoMesAtual} autoFocus onBlur={(e) => { 
                      const val = parseFloat(e.target.value) || 0;
                      setGanhosMensais({ ...ganhosMensais, [mesAnoChave]: val });
                      setEditandoGanhos(false); 
                    }} />
                  )}
                </div>

                <div className="section-comprometido-drop">
                  <div className="comprometido-header" onClick={() => setComprometidoAberto(!comprometidoAberto)} style={{ cursor: 'pointer' }}>
                    <span className="section-title">Comprometido no Mês {comprometidoAberto ? '▲' : '▼'}</span>
                    <span className="comprometido-total-num">R$ {comprometidoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {comprometidoAberto && (
                    <div className="comprometido-individual-list">
                      {despesasFixas.map(f => (
                        <div key={f.id} className="comp-indiv-card"><span>📋 {f.descricao} (Fixa)</span><strong>R$ {f.valor.toFixed(2)}</strong></div>
                      ))}
                      {assinaturas.map(a => (
                        <div key={a.id} className="comp-indiv-card"><span>📺 {a.nome} (Assinatura)</span><strong>R$ {a.valor.toFixed(2)}</strong></div>
                      ))}
                      {parcelamentos.map(p => (
                        <div key={p.id} className="comp-indiv-card"><span>💳 {p.nome} ({p.parcelaAtual}/{p.parcelaTotal})</span><strong>R$ {p.valor.toFixed(2)}</strong></div>
                      ))}
                      {variaveisDoMes.map(g => (
                        <div key={g.id} className="comp-indiv-card"><span>💬 {g.descricao} (Chat)</span><strong>R$ {g.valor.toFixed(2)}</strong></div>
                      ))}
                      {comprometidoTotal === 0 && <p style={{ color: '#444', fontSize: '12px', padding: '10px' }}>Nenhum valor lançado.</p>}
                    </div>
                  )}
                </div>

                <div className="section">
                  <h3 className="section-title">Status das Contas Fixas</h3>
                  {despesasFixas.length === 0 ? <p style={{ color: '#444', fontSize: '13px' }}>Nenhuma conta fixa salva.</p> : despesasFixas.map(f => {
                    const estaPago = !!historicoPagosFixas[`${mesAnoChave}_${f.id}`];
                    return (
                      <div key={f.id} className="item-row">
                        <div className="dot" style={{ background: estaPago ? '#33ff99' : '#ff4d4d' }}></div>
                        <div className="info" onClick={() => {
                          const chavePago = `${mesAnoChave}_${f.id}`;
                          setHistoricoPagosFixas({ ...historicoPagosFixas, [chavePago]: !historicoPagosFixas[chavePago] });
                        }}>
                          <p className="name">{f.descricao}</p>
                          <p className="date">Vence dia {f.vencimento} • {estaPago ? 'Pago' : 'Pendente'}</p>
                        </div>
                        <span className="val">R$ {f.valor.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="section">
                  <h3 className="section-title">Lançamentos do Chat (Este Mês)</h3>
                  {variaveisDoMes.length === 0 ? <p style={{ color: '#444', fontSize: '13px' }}>Nenhum gasto lançado pelo chat.</p> : variaveisDoMes.map(g => (
                    <div key={g.id} className="item-row">
                      <div className="info">
                        <p className="name">{g.descricao}</p>
                        <p className="date">Categoria: {g.categoria}</p>
                      </div>
                      <span className="val text-laranja" style={{ marginRight: '14px' }}>R$ {g.valor.toFixed(2)}</span>
                      <button className="btn-action-del-chat" onClick={() => setDespesasVariaveis(despesasVariaveis.filter(i => i.id !== g.id))}>✕</button>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {abaAtiva === 'fixas' && (
              <div className="page">
                <h2 className="section-title">Gerenciar Contas Fixas</h2>
                <div className="form-item-row-box">
                  <input type="text" placeholder="Nome da Conta" value={formFixa.descricao} onChange={e => setFormFixa({...formFixa, descricao: e.target.value})} className="input-custom-dark" />
                  <input type="number" placeholder="Valor (R$)" value={formFixa.valor} onChange={e => setFormFixa({...formFixa, valor: e.target.value})} className="input-custom-dark" />
                  <input type="number" placeholder="Dia do Vencimento" value={formFixa.vencimento} onChange={e => setFormFixa({...formFixa, vencimento: e.target.value})} className="input-custom-dark" />
                  <button className="btn-laranja-fluid" onClick={() => {
                    if(!formFixa.descricao || !formFixa.valor || !formFixa.vencimento) return alert('Preencha tudo!');
                    if(editandoFixaId) {
                      setDespesasFixas(despesasFixas.map(f => f.id === editandoFixaId ? {...f, descricao: formFixa.descricao, valor: parseFloat(formFixa.valor), vencimento: parseInt(formFixa.vencimento)} : f));
                      setEditandoFixaId(null);
                    } else {
                      setDespesasFixas([...despesasFixas, { id: Date.now(), descricao: formFixa.descricao, valor: parseFloat(formFixa.valor), vencimento: parseInt(formFixa.vencimento) }]);
                    }
                    setFormFixa({descricao: '', valor: '', vencimento: ''});
                  }}>{editandoFixaId ? 'Salvar Alteração' : 'Adicionar Conta Fixa'}</button>
                </div>
                
                <div className="section" style={{ marginTop: '16px' }}>
                  {despesasFixas.map(f => (
                    <div key={f.id} className="item-row">
                      <div className="info">
                        <p className="name">{f.descricao}</p>
                        <p className="date">R$ {f.valor.toFixed(2)} • Dia {f.vencimento}</p>
                      </div>
                      <div className="actions">
                        <button onClick={() => { setEditandoFixaId(f.id); setFormFixa({descricao: f.descricao, valor: f.valor.toString(), vencimento: f.vencimento.toString()}); }} style={{ background: 'none', border: 'none', marginRight: '12px' }}>✏️</button>
                        <button onClick={() => setDespesasFixas(despesasFixas.filter(i => i.id !== f.id))} style={{ background: 'none', border: 'none' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'visao' && (
              <div className="page">
                <div className="calendar-box-center" style={{ marginBottom: '10px' }}>
                  <button className="btn-arrow-cal" onClick={() => navegarMes(-1)}>‹</button>
                  <span className="text-date-cal" style={{ fontSize: '15px' }}>{obterMesAnoTexto(dataFiltro)}</span>
                  <button className="btn-arrow-cal" onClick={() => navegarMes(1)}>›</button>
                </div>

                <div className="sub-nav-vision">
                  <button className={subAbaVision === 'parcelamentos' ? 'active' : ''} onClick={() => setSubAbaVision('parcelamentos')}>📋 Parcelamentos</button>
                  <button className={subAbaVision === 'assinaturas' ? 'active' : ''} onClick={() => setSubAbaVision('assinaturas')}>📺 Assinaturas</button>
                  <button className={subAbaVision === 'categorias' ? 'active' : ''} onClick={() => setSubAbaVision('categorias')}>🏷️ Categorias</button>
                </div>

                {subAbaVision === 'categorias' && (
                  <>
                    <div className="vision-summary">
                      <div className="circle-progress">
                        <span className="total-num">R$ {totalVariaveis.toFixed(2)}</span>
                        <span className="total-lab">Gasto no Mês</span>
                      </div>
                    </div>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if(!novaCatNome.trim()) return;
                      setCategorias([...categorias, { nome: novaCatNome.trim(), ícone: '🏷️', cor: '#ff6600' }]);
                      setNovaCatNome('');
                    }} className="form-box-inline">
                      <input type="text" placeholder="+ Nova Categoria" value={novaCatNome} onChange={e => setNovaCatNome(e.target.value)} />
                      <button type="submit">Criar</button>
                    </form>

                    <div className="vision-list">
                      {categorias.map(cat => {
                        const totalCat = totaisPorCategoria[cat.nome] || 0;
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
                  </>
                )}

                {subAbaVision === 'assinaturas' && (
                  <div className="section">
                    <div className="form-item-row-box">
                      <input type="text" placeholder="Nome da Assinatura" value={formAssinatura.nome} onChange={e => setFormAssinatura({...formAssinatura, nome: e.target.value})} className="input-custom-dark" />
                      <input type="number" placeholder="Valor Mensal" value={formAssinatura.valor} onChange={e => setFormAssinatura({...formAssinatura, valor: e.target.value})} className="input-custom-dark" />
                      <button className="btn-laranja-fluid" onClick={() => {
                        if(!formAssinatura.nome || !formAssinatura.valor) return;
                        if(editandoAssinaturaId) {
                          setAssinaturas(assinaturas.map(a => a.id === editandoAssinaturaId ? {...a, nome: formAssinatura.nome, valor: parseFloat(formAssinatura.valor)} : a));
                          setEditandoAssuraId(null);
                        } else {
                          setAssinaturas([...assinaturas, { id: Date.now(), nome: formAssinatura.nome, valor: parseFloat(formAssinatura.valor) }]);
                        }
                        setFormAssinatura({ nome: '', valor: '' });
                      }}>{editandoAssinaturaId ? 'Salvar Alteração' : 'Adicionar Assinatura'}</button>
                    </div>

                    <h3 className="section-title" style={{ marginTop: '20px' }}>Suas Assinaturas</h3>
                    {assinaturas.map(a => (
                      <div key={a.id} className="item-row">
                        <span className="name">📺 {a.nome}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="val">R$ {a.valor.toFixed(2)}</span>
                          <button onClick={() => { setEditandoAssuraId(a.id); setFormAssinatura({ nome: a.nome, valor: a.valor.toString() }); }} style={{ background: 'none', border: 'none' }}>✏️</button>
                          <button onClick={() => setAssinaturas(assinaturas.filter(i => i.id !== a.id))} style={{ background: 'none', border: 'none' }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {subAbaVision === 'parcelamentos' && (
                  <div className="section">
                    <div className="form-item-row-box">
                      <input type="text" placeholder="Nome da Compra" value={formParcela.nome} onChange={e => setFormParcela({...formParcela, nome: e.target.value})} className="input-custom-dark" />
                      <input type="number" placeholder="Valor da Parcela" value={formParcela.valor} onChange={e => setFormParcela({...formParcela, valor: e.target.value})} className="input-custom-dark" />
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input type="number" placeholder="Parc. Atual" value={formParcela.atual} onChange={e => setFormParcela({...formParcela, atual: e.target.value})} className="input-custom-dark" />
                        <input type="number" placeholder="Total Parc." value={formParcela.total} onChange={e => setFormParcela({...formParcela, total: e.target.value})} className="input-custom-dark" />
                      </div>
                      <button className="btn-laranja-fluid" onClick={() => {
                        if(!formParcela.nome || !formParcela.valor) return;
                        if(editandoParcelaId) {
                          setParcelamentos(parcelamentos.map(p => p.id === editandoParcelaId ? {...p, nome: formParcela.nome, valor: parseFloat(formParcela.valor), parcelaAtual: parseInt(formParcela.atual), parcelaTotal: parseInt(formParcela.total)} : p));
                          setEditandoParcelaId(null);
                        } else {
                          setParcelamentos([...parcelamentos, { id: Date.now(), nome: formParcela.nome, valor: parseFloat(formParcela.valor), parcelaAtual: parseInt(formParcela.atual) || 1, parcelaTotal: parseInt(formParcela.total) || 12 }]);
                        }
                        setFormParcela({ nome: '', valor: '', atual: '', total: '' });
                      }}>{editandoParcelaId ? 'Salvar Alteração' : 'Adicionar Parcelamento'}</button>
                    </div>

                    <h3 className="section-title" style={{ marginTop: '20px' }}>Seus Parcelamentos</h3>
                    {parcelamentos.map(p => (
                      <div key={p.id} className="item-row">
                        <div className="info">
                          <p className="name">💳 {p.nome}</p>
                          <p className="date">Parcela {p.parcelaAtual} de {p.parcelaTotal}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className="val">R$ {p.valor.toFixed(2)}</span>
                          <button onClick={() => { setEditandoParcelaId(p.id); setFormParcela({ nome: p.nome, valor: p.valor.toString(), atual: p.parcelaAtual.toString(), total: p.parcelaTotal.toString() }); }} style={{ background: 'none', border: 'none' }}>✏️</button>
                          <button onClick={() => setParcelamentos(parcelamentos.filter(i => i.id !== p.id))} style={{ background: 'none', border: 'none' }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {abaAtiva === 'chat' && (
              <div className="page" style={{ height: 'calc(100vh - 140px)', paddingBottom: '0' }}>
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
              </div>
            )}

            {abaAtiva === 'perfil' && (
              <div className="page">
                <h2 className="section-title">Meu Perfil</h2>
                <div className="form-item-row-box text-center-box">
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🦊</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{nome || 'Usuário'}</h3>
                  <p style={{ fontSize: '13px', color: '#666680', marginTop: '2px' }}>{userEmail}</p>
                </div>

                <div className="form-item-row-box">
                  <h4 className="section-title" style={{ fontSize: '13px' }}>Alterar Nome de Exibição</h4>
                  <input type="text" placeholder="Novo Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="input-custom-dark" />
                </div>

                <form onSubmit={alterarSenhaReal} className="form-item-row-box">
                  <h4 className="section-title" style={{ fontSize: '13px' }}>Segurança (Alterar Senha)</h4>
                  <input type="password" placeholder="Nova Senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="input-custom-dark" />
                  <button type="submit" className="btn-laranja-fluid">Atualizar Senha</button>
                </form>

                <button className="btn-laranja-fluid" style={{ backgroundColor: '#ff4d4d', marginTop: '10px' }} onClick={() => signOut(auth)}>
                  Fazer Logout / Sair da Conta 🚪
                </button>
              </div>
            )}

          </div>

          <nav className="nav-floating">
            <button className={abaAtiva === 'inicio' ? 'active' : ''} onClick={() => setAbaAtiva('inicio')}>
              <span>🏠</span><span className="nav-text">Início</span>
            </button>
            <button className={abaAtiva === 'fixas' ? 'active' : ''} onClick={() => setAbaAtiva('fixas')}>
              <span>📋</span><span className="nav-text">Fixas</span>
            </button>
            <button className={abaAtiva === 'visao' ? 'active' : ''} onClick={() => setAbaAtiva('visao')}>
              <span>📊</span><span className="nav-text">Visão</span>
            </button>
            <button className={abaAtiva === 'chat' ? 'active' : ''} onClick={() => setAbaAtiva('chat')}>
              <span>💬</span><span className="nav-text">Chat</span>
            </button>
            <button className={abaAtiva === 'perfil' ? 'active' : ''} onClick={() => setAbaAtiva('perfil')}>
              <span>👤</span><span className="nav-text">Perfil</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
