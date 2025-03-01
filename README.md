# Fletgram

Fletgram é um aplicativo de compartilhamento de fotos e vídeos inspirado no Instagram, desenvolvido para fins de aprendizado. O projeto é **open-source** e possui funcionalidades como postagens, curtidas, comentários, seguidores, mensagens diretas, Stories e Reels.

> **Aviso:** Este projeto é apenas para aprendizado e não deve ser utilizado comercialmente.

## Tecnologias Utilizadas

### **Frontend**
- **React Native** (Bare Workflow)
- **Expo**
- **React Navigation**
- **React Native Share**

### **Backend**
- **Spring Boot**
- **MySQL**
- **Spring Security**
- **LocalTunnel** (para hospedar a API temporariamente)

## Funcionalidades
- **Autenticação de usuários** (login, cadastro, verificação de e-mail e telefone)
- **Perfil do usuário** (foto, biografia, seguidores e seguidos)
- **Postagens** (fotos e vídeos)
- **Curtidas e comentários**
- **Mensagens diretas e reações**
- **Stories e Reels**
- **Atualização automática do APK**

## Como Executar o Projeto

### **Backend (Spring Boot)**

1. Clone o repositório:
   ```sh
   git clone https://github.com/FletserW/FletgramApi.git
   ```
2. Configure o banco de dados MySQL (crie um banco chamado `fletgrambd`).
3. Altere as credenciais no arquivo `application.properties`.
4. Inicie o backend com:
   ```sh
   mvn spring-boot:run
   ```

### **Frontend (React Native)**

1. Acesse a pasta do frontend:
   ```sh
   cd fletgram
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Inicie o Expo:
   ```sh
   expo start
   ```
4. Use um emulador ou dispositivo físico para testar o app.

## Banco de Dados
O projeto utiliza o MySQL com as seguintes tabelas principais:
- **users**: armazena informações dos usuários.
- **posts**: gerencia as postagens.
- **likes**: registra curtidas.
- **comments**: armazena comentários.
- **followers**: gerencia seguidores e seguidos.
- **messages**: gerencia mensagens diretas.
- **stories e reels**: suporta Stories e Reels.

## Atualização Automática do APK
O Fletgram verifica automaticamente novas versões do APK ao iniciar o aplicativo.
1. O backend fornece a URL do APK mais recente.
2. O frontend verifica a versão instalada e baixa a nova versão, se necessário.

## Contribuição
Como o projeto é open-source, contribuições são bem-vindas! Para contribuir:
1. Faça um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Faça commit das alterações: `git commit -m 'Adicionando nova feature'`
4. Faça push para o repositório: `git push origin minha-feature`
5. Abra um Pull Request.

## Licença
Este projeto é distribuído sob a licença MIT.

## Contato
Caso tenha alguma dúvida ou sugestão, entre em contato pelo GitHub.

Me procure no meu email: fletsertech@gmail.com

