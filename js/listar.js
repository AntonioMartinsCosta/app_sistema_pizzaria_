// Função para listar os usuários
async function listarUsuarios() {
  // Obter o token do localStorage
  const token = localStorage.getItem("token");
  const userIdLogado = localStorage.getItem("userId");

  try {
    if (token) {
      // Fazer uma requisição para a API protegida para obter os dados do usuário
      const response = await fetch("http://localhost:8000/api/user/listar", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const usuarios = await response.json();

        // Seleciona o corpo da tabela
        const tabelaUsuarios = document.getElementById("tabelaUsuarios");
        tabelaUsuarios.innerHTML = ""; // Limpa a tabela

        // Itera sobre os usuários e adiciona cada um à tabela
        usuarios.user.data.forEach((usuario, index) => {
          const dataCriacao = new Date(usuario.created_at);
          const dataFormatada = dataCriacao.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Formato 24 horas
          });
          const row = document.createElement("tr");
          row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${usuario.name}</td>
                        <td>${usuario.email}</td>
                        <td>${dataFormatada}</td>
                        <td>
                            <button class="btn btn-info btn-sm visualizar-usuario" data-id="${
                              usuario.id
                            }">
                                <i class="fas fa-eye"></i>
                            </button>

                            <button class="btn btn-info btn-sm modificar-usuario" data-id="${
                              usuario.id
                            }">
                                <i class="fas fa-pencil"></i>
                            </button>
                            ${
                              usuario.id != userIdLogado
                                ? `<button class="btn btn-danger btn-sm excluir-usuario" data-id="${usuario.id}">
                                    <i class="fas fa-trash-alt"></i>
                                   </button>`
                                : ""
                            } <!-- Mostra o botão de excluir apenas se o id for diferente -->
                        </td>
                    `;
          tabelaUsuarios.appendChild(row);
        });

        // Adiciona o evento de clique para excluir o usuário
        document.querySelectorAll(".excluir-usuario").forEach((button) => {
          button.addEventListener("click", async function () {
            const userId = this.getAttribute("data-id");
            const confirmar = confirm(
              "Tem certeza que deseja excluir este usuário?"
            );
            if (confirmar) {
              await excluirUsuario(userId);
            }
          });
        });

        document.querySelectorAll(".visualizar-usuario").forEach((button) => {
          button.addEventListener("click", function () {
            const userId = this.getAttribute("data-id");
            visualizarUsuario(userId);
          });
        });

        document.querySelectorAll(".modificar-usuario").forEach((button) => {
          button.addEventListener("click", function () {
            const userId = this.getAttribute("data-id");
            modificarUsuario(userId);
          });
        });

        document.querySelectorAll(".atualizar-usuario").forEach((button) => {
          button.addEventListener("click", function () {
            redefinirUsuario();
          });
        });
      } else {
        throw new Error("Erro ao buscar os usuários");
      }
    } else {
      // Redireciona para o login se o token não existir
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Erro:", error);
    const mensagemErro = document.getElementById("mensagemErro");
    mensagemErro.textContent = "Erro ao carregar a lista de usuários";
    mensagemErro.classList.remove("d-none");
  }
}

// Função para excluir o usuário
async function excluirUsuario(userId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `http://localhost:8000/api/user/deletar/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      alert("Usuário excluído com sucesso!");
      listarUsuarios(); // Recarregar a lista de usuários
    } else {
      throw new Error("Erro ao excluir o usuário");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao excluir o usuário.");
  }
}

function visualizarUsuario(userId) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Preenche os dados do modal
      document.getElementById("usuarioNome").textContent = data.user.name;
      document.getElementById("usuarioEmail").textContent = data.user.email;

      const dataCriacao = new Date(data.user.created_at);
      document.getElementById("usuarioDataCriacao").textContent =
        dataCriacao.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

      // Abre o modal de visualização
      const visualizarModal = new bootstrap.Modal(
        document.getElementById("visualizarUsuarioModal")
      );
      visualizarModal.show();
    })
    .catch((error) => {
      console.error("Erro ao visualizar o usuário:", error);
    });
}

function modificarUsuario(usuarioId) {
  const tokenAcesso = localStorage.getItem("token");

  fetch(`http://localhost:8000/api/user/visualizar/${usuarioId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenAcesso}`,
      "Content-Type": "application/json",
    },
  })
    .then((resposta) => resposta.json())
    .then((dados) => {
      // Popula os campos do formulário com os dados do usuário
      document.getElementById("usuarioNomeForm").value = dados.user.name;
      document.getElementById("usuarioEmailForm").value = dados.user.email;
      document.getElementById("usuarioCodigoForm").value = dados.user.id;

      // Exibe o modal de edição
      const editarModal = new bootstrap.Modal(
        document.getElementById("editarUsuarioModal")
      );
      editarModal.show();
    })
    .catch((erro) => {
      console.error("Erro ao buscar informações do usuário:", erro);
    });
}

function redefinirUsuario() {
  const tokenAcesso = localStorage.getItem("token");

  const usuarioId = document.getElementById("usuarioCodigoForm").value;
  const nome = document.getElementById("usuarioNomeForm").value;
  const email = document.getElementById("usuarioEmailForm").value;
  const senha = document.getElementById("usuarioSenhaForm").value;
  const confirmacaoSenha = document.getElementById(
    "usuarioConfirmaSenhaForm"
  ).value;

  fetch(`http://localhost:8000/api/user/atualizar/${usuarioId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tokenAcesso}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: nome,
      email: email,
      password: senha,
      password_confirmation: confirmacaoSenha,
    }),
  })
    .then((resposta) => resposta.json())
    .then((dados) => {
      const msgSucesso = document.getElementById("mensagemSucesso");
      msgSucesso.textContent = dados.message;
      msgSucesso.classList.remove("d-none");

      // Atualiza a lista de usuários
      listarUsuarios();
    })
    .catch((erro) => {
      console.error("Erro ao atualizar os dados do usuário:", erro);
      const msgErro = document.getElementById("mensagemErro");
      msgErro.textContent = "Erro ao salvar as alterações";
      msgErro.classList.remove("d-none");
    });
}

// Chama a função para listar os usuários assim que a página for carregada
document.addEventListener("DOMContentLoaded", listarUsuarios);
