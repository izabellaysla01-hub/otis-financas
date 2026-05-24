import React, { useState, useEffect, useRef } from 'react';
import './style.css';

export default function App() {
  const [step, setStep] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    nascimento: '',
    motivacao: ''
  });

  const [ganhos, setGanhos] = useState(5000.00);
  const [editandoGanhos, setEditandoGanhos] = useState(false);
  const [novoGanhoInput, setNovoGanhoInput] = useState('5000');

  const [despesasFixas, setDespesasFixas] = useState([
    { id: 1, descricao: 'Internet Alis', valor: 99.90, vencimento: 10, pago: false },
    { id: 2, descricao: 'Netflix', valor: 55.90, vencimento: 15, pago: true },
    { id: 3, descricao: 'Conta de Luz', valor: 180.00, vencimento: 20, pago: false }
  ]);

  const [novaFixa, setNovaFixa] = useState({ descricao: '', valor: '', vencimento: '' });

  const [mensagens, setMensagens] = useState([
    { id: 1, remetente: 'app', texto: 'Oi! Eu sou o Otis, seu assistente financeiro. Digite um gasto do dia a dia (ex: "Pastel R$ 15") para eu registrar aqui.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [despesasVariaveis, setDespesasVariaveis] = useState([]);
  
  const limiteDespesasVariaveis = 500.00; 
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  const avancar = () => setStep(step + 1);
  const voltar = () => setStep(step - 1);
  const logarApp = () => setStep(4);

  const totalFixas = despesasFixas.reduce((acc, curr) => acc + curr.valor, 0);
  const totalVariaveis = despesasVariaveis.reduce((acc, curr) => acc + curr.valor, 0);
  const valorSobrelante = ganhos - totalFixas - totalVariaveis;

  const salvarGanhos = () => {
    const valorNum = parseFloat(novoGanhoInput);
    if (!isNaN(valorNum) && valorNum >= 0) setGanhos(valorNum);
    setEditandoGanhos(false);
  };

  const adicionarDespesaFixa = (e) => {
    e.preventDefault();
    if (!novaFixa.descricao || !novaFixa.valor || !novaFixa.vencimento) return;
    const nova = {
      id: Date.now(),
      descricao: novaFixa.descricao,
      valor: parseFloat(novaFixa.valor),
      vencimento: parseInt(novaFixa.vencimento),
      pago: false
    };
    setDespesasFixas([...despesasFixas, nova]);
    setNovaFixa({ descricao: '', valor: '', vencimento: '' });
    alert('Despesa fixa cadastrada com sucesso!');
  };

  const alternarPago = (id) => {
    setDespesasFixas(despesasFixas.map(item => item.id === id ? { ...item, pago: !item.pago } : item));
  };

  const enviarMensagemChat = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textoUsuario = inputText;
    const novaMsgUsuario = { id: Date.now(), remetente: 'usuario', texto: textoUsuario };
    setMensagens(prev => [...prev, novaMsgUsuario]);
    setInputText('');

    const numerosEncontrados = textoUsuario.match(/\d+([.,]\d+)?/);
    
    setTimeout(() => {
      if (numerosEncontrados) {
        const valorGasto = parseFloat(numerosEncontrados[0].replace(',', '.'));
        
        const novoGastoVariavel = {
          id: Date.now() + 1,
          descricao: textoUsuario.replace(/[R$]*\d+([.,]\d+)?/, '').trim() || 'Gasto no Chat',
          valor: valorGasto
        };

        setDespesasVariaveis(prev => [...prev, novoGastoVariavel]);
        const novoTotalVariaveis = totalVariaveis + valorGasto;

        let respostaTexto = `Recebido! O Otis já registrou seu gasto de R$ ${valorGasto.toFixed(2)}. Esse valor foi deduzido do seu Sobrelante.`;

        if (novoTotalVariaveis >= limiteDespesasVariaveis) {
          respostaTexto += `\n\n⚠️ ATENÇÃO! Suas despesas diárias chegaram a R$ ${novoTotalVariaveis.toFixed(2)}, estourando o limite estipulado de R$ ${limiteDespesasVariaveis.toFixed(2)}! Hora de segurar os gastos.`;
        } else if (novoTotalVariaveis >= limiteDespesasVariaveis * 0.8) {
          respostaTexto += `\n\n👀 FIQUE DE OLHO! Você já gastou R$ ${novoTotalVariaveis.toFixed(2)} em despesas aleatórias. Está bem perto do seu limite de R$ ${limiteDespesasVariaveis.toFixed(2)}.`;
        }

        setMensagens(prev => [...prev, { id: Date.now() + 2, remetente: 'app', texto: respostaTexto }]);
      } else {
        setMensagens(prev => [...prev, { id: Date.now() + 2, remetente: 'app', texto: 'Não consegui entender o valor. Tente digitar informando o preço, por exemplo: "Farmácia R$ 45".' }]);
      }
    }, 800);
  };

  return (
    <div className="container-app">
      {step < 4 && (
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
                  <button onClick={avancar} className="btn-branco">Continuar com o Google</button>
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
                  <input type="text" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="input-custom" />
                  <input type="text" placeholder="Sobrenome" value={formData.sobrenome} onChange={(e) => setFormData({...formData, sobrenome: e.target.value})} className="input-custom" />
                  <input type="text" placeholder="Data de nascimento" value={formData.nascimento} onChange={(e) => setFormData({...formData, nascimento: e.target.value})} className="input-custom" />
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
                <button onClick={logarApp} className="btn-branco m-top">Finalizar e Entrar</button>
              </div>
            )}
          </div>
          <div className="footer-seguranca">Dados protegidos com criptografia.</div>
        </div>
      )}

      {step === 4 && (
        <div className="app-logado">
          <header className="header-usuario">
            <div>
              <p className="boas-vindas">Olá, {formData.nome || 'Visitante'} 👋</p>
              <h2 className="subtitulo-app">Seu painel financeiro</h2>
            </div>
            <div className="avatar-mini">🦊</div>
          </header>

          <div className="conteudo-aba">
            {abaAtiva === 'inicio' && (
              <div className="space-aba">
                <div className="card-sobrelante">
                  <p className="label-card">VALOR SOBRELANTE LIVRE</p>
                  <h2 className="valor-destaque">R$ {valorSobrelante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                  <p className="desc-card">O que sobra real após as contas fixas e gastos do chat.</p>
                </div>

                <div className="grid-resumos">
                  <div className="mini-card" style={{ cursor: 'pointer' }}>
                    <span className="mini-label">Ganhos do Mês ✏️</span>
                    {editandoGanhos ? (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <input type="number" value={novoGanhoInput} onChange={(e) => setNovoGanhoInput(e.target.value)} className="input-custom" style={{ padding: '4px 8px', fontSize: '14px', borderRadius: '6px' }} autoFocus />
                        <button onClick={salvarGanhos} className="btn-laranja" style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}>✓</button>
                      </div>
                    ) : (
                      <p className="mini-valor text-verde" onClick={() => setEditandoGanhos(true)}>R$ {ganhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                  </div>
                  <div className="mini-card">
                    <span className="mini-label">Comprometido total</span>
                    <p className="mini-valor text-laranja">R$ {(totalFixas + totalVariaveis).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {despesasVariaveis.length > 0 && (
                  <div className="bloco-lista">
                    <h3 className="titulo-secao">Gastos do dia a dia (Chat)</h3>
                    <div className="lista-contas">
                      {despesasVariaveis.map(g => (
                        <div key={g.id} className="item-conta-painel">
                          <span className="item-nome">💬 {g.descricao}</span>
                          <span className="item-valor text-laranja">R$ {g.valor.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bloco-lista">
                  <h3 className="titulo-secao">Status das Contas Fixas</h3>
                  <div className="lista-contas">
                    {despesasFixas.map((item) => (
                      <div key={item.id} className="item-conta-painel" onClick={() => alternarPago(item.id)}>
                        <div className="item-esquerda">
                          <div className={`indicador-status ${item.pago ? 'pago' : 'pendente'}`}></div>
                          <div>
                            <p className="item-nome">{item.descricao}</p>
                            <p className="item-venc">Vence dia {item.vencimento}</p>
                          </div>
                        </div>
                        <div className="item-direita">
                          <p className="item-valor">R$ {item.valor.toFixed(2)}</p>
                          <span className={`badge-status ${item.pago ? 'pago' : 'pendente'}`}>{item.pago ? 'Pago' : 'Pendente'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === 'fixas' && (
              <div className="space-aba">
                <div className="titulo-bloco">
                  <h2 className="subtitulo">Cadastrar Conta Fixa</h2>
                  <p className="descricao">Insira as contas fixas da sua planilha uma única vez.</p>
                </div>
                <form onSubmit={adicionarDespesaFixa} className="grupo-inputs bg-box">
                  <input type="text" placeholder="Nome (Ex: Aluguel, Luz)" value={novaFixa.descricao} onChange={(e) => setNovaFixa({...novaFixa, descricao: e.target.value})} className="input-custom" />
                  <input type="number" placeholder="Valor (R$)" value={novaFixa.valor} onChange={(e) => setNovaFixa({...novaFixa, valor: e.target.value})} className="input-custom" />
                  <input type="number" placeholder="Dia do Vencimento (1 a 31)" value={novaFixa.vencimento} onChange={(e) => setNovaFixa({...novaFixa, vencimento: e.target.value})} className="input-custom" />
                  <button type="submit" className="btn-laranja">Salvar Despesa Fixa</button>
                </form>
              </div>
            )}

            {abaAtiva === 'chat' && (
              <div className="container-chat-real">
                <div className="historico-mensagens">
                  {mensagens.map(m => (
                    <div key={m.id} className={`wrapper-mensagem ${m.remetente}`}>
                      <div className={`balao-mensagem ${m.remetente}`}>
                        {m.texto.split('\n\n').map((paragrafo, idx) => (
                          <p key={idx} style={{ marginTop: idx > 0 ? '8px' : '0' }}>{paragrafo}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={enviarMensagemChat} className="form-input-chat">
                  <input type="text" placeholder="Fale com o Otis: 'Uber R$ 20'..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="input-chat" />
                  <button type="submit" className="btn-enviar-chat">➔</button>
                </form>
              </div>
            )}
          </div>

          <nav className="menu-inferior">
            <button onClick={() => setAbaAtiva('inicio')} className={`btn-menu-item ${abaAtiva === 'inicio' ? 'ativo' : ''}`}>🏠 <span className="label-menu">Início</span></button>
            <button onClick={() => setAbaAtiva('fixas')} className={`btn-menu-item ${abaAtiva === 'fixas' ? 'ativo' : ''}`}>📋 <span className="label-menu">Fixas</span></button>
            <button onClick={() => setAbaAtiva('chat')} className={`btn-menu-item ${abaAtiva === 'chat' ? 'ativo' : ''}`}>💬 <span className="label-menu">Chat</span></button>
          </nav>
        </div>
      )}
    </div>
  );
}
