# Smart Energy Dashboard

## 🌍 Overzicht

Het **Smart Energy Dashboard** is een slimme webapplicatie waarmee gebruikers realtime inzicht krijgen in hun energieverbruik. Met live data, historische analyses, AI-voorspellingen en automatische meldingen helpt dit dashboard zowel particulieren als bedrijven om grip te krijgen op hun energiegebruik en kosten te besparen. Admins kunnen eenvoudig gebruikers en apparaten beheren, en het systeem is schaalbaar voor meerdere klanten.

---

## 🚩 Probleemstelling
Veel mensen en bedrijven hebben weinig inzicht in hun actuele energieverbruik. Vaak krijg je pas aan het einde van de maand een overzicht, waardoor je te laat bent om bij te sturen. Er is meestal geen systeem dat automatisch waarschuwt bij piekverbruik of storingen (zoals uitvallende zonnepanelen), en voorspellingen voor toekomstig verbruik ontbreken. Voor bedrijven/admins ontbreekt een centraal platform om meerdere klanten te beheren en snel in te grijpen bij problemen.

---

## 💡 Oplossing
Het Smart Energy Dashboard biedt:
- **Realtime inzicht** in energieverbruik via een overzichtelijk dashboard
- **Automatische meldingen** bij overschrijding van limieten of storingen
- **AI-voorspellingen** van toekomstig energieverbruik
- **Historische data** en vergelijkingen
- **Beheeromgeving** voor admins en superadmins (gebruikers, apparaten, instellingen)
- **Schaalbaarheid** voor meerdere klanten/gebruikers
- **Sterke beveiliging** met rollen, JWT en OAuth2

Alle data wordt veilig opgeslagen in een relationele database en automatisch verwerkt via een ETL-pipeline.

---

## ✅ Feature Checklist

- [x] Live energieverbruik visualiseren
- [x] Historische data bekijken en vergelijken
- [x] AI-voorspellingen voor toekomstig verbruik (optioneel, via Mistral API)
- [x] Automatische alerts en notificaties
- [x] Apparaten beheren en zichtbaar/verborgen maken
- [x] Instellingenpagina (notificaties, apparaten, grafieken)
- [x] Gebruikersbeheer (admin/superadmin)
- [x] Admin dashboard
- [x] Veilige login en autorisatie (JWT, rollen)
- [x] Responsive en gebruiksvriendelijke UI
- [x] Caching en performance optimalisaties

---

## ✨ Features
- Live energieverbruik visualiseren
- Historische data bekijken en vergelijken
- AI-voorspellingen voor toekomstig verbruik
- Automatische alerts en notificaties
- Apparaten beheren en zichtbaar/verborgen maken
- Instellingen aanpassen (notificaties, grafieken, apparaten)
- Gebruikersbeheer (admin/superadmin)
- Admin dashboard en AI management
- Veilige login en autorisatie

---

## 👤 User Stories
- Als gebruiker wil ik realtime mijn energieverbruik kunnen zien, zodat ik inzicht krijg in wat ik verbruik en eventueel kan besparen.
- Als gebruiker wil ik meldingen ontvangen als mijn energieverbruik te hoog wordt, zodat ik meteen weet dat ik moet ingrijpen.
- Als gebruiker wil ik historische data kunnen bekijken, zodat ik mijn verbruik over tijd kan analyseren en vergelijken.
- Als gebruiker wil ik voorspellingen kunnen zien van mijn verwachte energieverbruik, zodat ik me kan voorbereiden op mijn toekomstige verbruik.
- Als gebruiker wil ik zelf mijn grafieken kunnen aanpassen (bijvoorbeeld type en periode), zodat de data voor mij overzichtelijker wordt.
- Als admin wil ik gebruikers kunnen beheren, zodat ik accounts kan aanmaken, aanpassen of verwijderen.
- Als superadmin wil ik AI-modellen kunnen beheren en retrainen, zodat de voorspellingen accuraat blijven.
- Als admin wil ik meldingen en notificaties kunnen bekijken en beheren, zodat ik de status van het systeem in de gaten kan houden.
- Als gebruiker wil ik mijn eigen apparaten kunnen beheren (bijvoorbeeld slimme stekkers), zodat ik zelf kan bepalen welke apparaten meedoen.
- Als gebruiker wil ik notificatie-instellingen kunnen aanpassen, zodat ik zelf bepaal wanneer ik meldingen krijg.

---

## 🗂️ Product Backlog (globaal)
- Realtime data ophalen van API of bestand
- Live energieverbruik visualiseren op dashboard
- AI forecasting implementeren
- Grafieken interactief en aanpasbaar maken
- Historische data kunnen filteren en bekijken
- Alerts aanmaken bij overschrijding van limieten
- Notificatiesysteem bouwen (e-mail, push)
- Gebruikersbeheer bouwen (rollen: klant, admin, superadmin)
- Instellingenpagina maken (apparaten, notificaties, grafiekinstellingen)
- Admin dashboard bouwen voor beheerders
- AI management paneel voor superadmins
- Dataverwerkingspipeline bouwen (ETL-proces)
- Database ontwerpen en inrichten
- Security implementeren (login, autorisatie, tokens)

---

## 🛠️ Technische Stack
- **Frontend:** React (Vite, TypeScript, Tailwind CSS)
- **Backend:** Python (FastAPI)
- **Database:** MySQL
- **AI/ML:** Python (scikit-learn, TensorFlow)
- **Security:** JWT, OAuth2, rollen-gebaseerde toegang
- **Design:** Figma, draw.io, UXPilot

---

## 🤖 AI & Voorspellingen 
- Het dashboard ondersteunt optioneel AI-functionaliteit via de Mistral API (externe LLM).
- AI wordt gebruikt om labels, eenheden en iconen te raden voor onbekende datavelden (indien een Mistral API key is ingesteld).
- De AI-voorspelling-widget toont een voorspelling van het energieverbruik, gebaseerd op een veld uit de backend (meestal een simpele berekening of dummywaarde).
- Er is géén lokaal getraind AI-model (zoals scikit-learn of TensorFlow) in deze versie.
- Alerts en tips zijn gebaseerd op eenvoudige logica of dummydata, niet op echte AI-analyse.
- Wil je echte AI-voorspellingen, dan kun je zelf een Mistral API key toevoegen en de backend uitbreiden.

---

## 🏁 How to Run (Stap-voor-stap)

### 1. Backend starten

1. Open een terminal/command prompt.
2. Ga naar de backend-map:
   ```bash
   cd backend
   ```
3. Maak een Python virtual environment aan:
   - **Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
4. Installeer de Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Zorg dat je MySQL database draait en het schema is geïmporteerd (zie `.env` en `schema.sql`).
6. Start de backend server:
   ```bash
   uvicorn src.main:app --reload
   ```
   De backend draait nu op [http://localhost:8000](http://localhost:8000)

---

### 2. Frontend starten

1. Open een nieuwe terminal/command prompt.
2. Ga naar de frontend-map:
   ```bash
   cd frontend/frontend
   ```
3. Installeer de Node.js dependencies:
   ```bash
   npm install
   ```
4. Start de frontend development server:
   ```bash
   npm run dev
   ```
   De frontend draait nu op [http://localhost:5173](http://localhost:5173) (standaard Vite-poort)

---

**Tip:** Zorg dat zowel backend als frontend tegelijk draaien voor een werkende applicatie.

---

## 🖼️ Screenshots
> Voeg hier screenshots toe van het dashboard, instellingen, alerts, etc.

---

## 💻 Demo
- Lokaal draaien: zie installatie hierboven
- (Optioneel) Live demo: [link hier]

---

## 👥 Team / Contributors
- [Jouw naam]
- [Teamleden toevoegen]

---

## 📝 Changelog (laatste dag)
- Final UI polish
- Bugfixes in dashboard en alerts
- Documentatie en README geüpdatet
- Synchronisatie apparaten en instellingen verbeterd
- Caching en performance verbeterd

---


