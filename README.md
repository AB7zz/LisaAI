# **LisaAI: AI-Powered Decentralized Recruitment Platform**

## **Overview**  
LisaAI is a decentralized platform designed to revolutionize the recruitment process. By combining AI-powered interview automation, zero-knowledge proof protocols, and blockchain-based attestation, LisaAI simplifies hiring workflows, ensures data integrity, and enhances privacy for both recruiters and candidates.  

---

## **Key Features**

1. **Recruiter Dashboard**  
   - Define job roles, descriptions, and requirements.  
   - Use AI to generate relevant interview questions that can be edited by the recruiter.  
   - Generate and share unique interview links with candidates.  

2. **Candidate Verification**  
   - **Zero-Knowledge Email Proofs**:  
     - Verifies email authenticity using **ZK Email**, ensuring communication is from legitimate domains.  
   - **Privacy-Preserving Identity Verification**:  
     - Verifies candidates' identities using **Anon Aadhaar**, a zero-knowledge protocol for Aadhaar ID validation.  

3. **AI-Driven Interview Process**  
   - Interviews conducted via **Huddle01**, a decentralized video conferencing platform.  
   - **Real-Time Analysis**:  
     - AI agents analyze candidate responses to questions during the interview and evaluate answers in real-time.  

4. **Blockchain-Based Attestation**  
   - Uses **Ethereum Attestation Service (EAS)** to create tamper-proof attestations of candidate scores and results.  
   - Data is deployed on **Polygon** and **Base** blockchains to ensure decentralized, secure storage.  

5. **Decentralized Data Storage**  
   - Stores interview questions securely in **Akave** (ZK-compatible object storage) .

6. **Wallet Integration**  
   - Employs **OKTO** SDK for wallet creation and transaction orchestration. Candidate scores are linked to wallets for immutable records.  

7. **Structuring and Rapid Deployment**  
   - Developed using **BuidlGuidl.eth**'s **Scaffold-ETH 2**, which provides Ethereum development tools for rapid smart contract deployment and DApp creation.  

---

## **Technologies Used**

1. **Huddle01**  
   - Decentralized video conferencing platform integrated with real-time AI analysis for interview scoring.  

1. **ZK Email**  
   - Provides zero-knowledge email proofs to verify legitimate communication from recruiters.  

2. **Anon Aadhaar**  
   - Enables Aadhaar ID verification in a privacy-preserving manner.  

4. **Ethereum Attestation Service (EAS)**  
   - Creates tamper-proof attestations for candidate scores and results, ensuring secure and verifiable records.  

5. **Polygon and Base Chains**  
   - Deploys attestations on **Polygon** and **Base**, leveraging their scalability and Ethereum compatibility for secure data storage.  

6. **OKTO SDK**  
   - Facilitates wallet creation and multi-chain transaction orchestration.  

7. **Akave**  
   - Decentralized ZK-compatible object storage for securely storing interview questions with unique keys.  Akave APIs and  Akave bucket are used.  

8. **BuidlGuidl.eth / Scaffold-ETH 2**  
   - Provides a structured framework for smart contract development and DApp deployment.  


---

## **How It Works**

### **Recruiter Workflow**  
1. Recruiters log in and define job requirements.  
2. AI generates interview questions, which can be customized by the recruiter.  
3. A unique interview link is created and shared with candidates.  

### **Candidate Workflow**  
1. Candidates access the link and complete a two-step verification:  
   - **ZK Email** for email verification.  
   - **Anon Aadhaar** for identity validation.  
2. Candidates join the interview via Huddle01.  
3. AI conducts the interview by asking pre-generated questions and analyzing responses in real-time.  

### **Post-Interview**  
1. Candidate responses are scored by the AI.  
2. Scores and results are attested on the Ethereum blockchain using EAS.  
3. Attestation data is deployed on Polygon and Base for decentralized and tamper-proof storage.  
4. Interview questions are stored securely in Akave and Filecoin.  

---

