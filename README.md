# TeamMatch AI · Student Hackathon Teammate Matching

**TeamMatch AI** is a competition-ready web application designed for student hackathons and collaborative project incubators. Re-architected with a modern, premium **White Theme SaaS aesthetic** inspired by Linear and Notion, it enables students to discover complementary teammates based on demonstrated technical skills, preferred roles, and project goals, providing transparent, explainable recommendations and an interactive topological network graph of student connections.

---

## 🚀 Quick Run Instructions

The application is built on React 19, TypeScript, Tailwind CSS v4, and Cytoscape.js.

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript verification
npm run lint

# Build for production
npm run build
```

---

## ⚙️ API Configuration Location

The external API base URL is centrally configured in:
* **Code location:** `src/services/apiService.ts` (`ApiService` singleton class)
* **Environment variable:** `VITE_API_BASE_URL` in `.env` (optional)
* **In-App UI control:** Click the **Backend Config** button in the hero area or the **Demo Mode / Backend Connected** badge in the top navigation bar. This opens the **API Integration Settings Modal** where judges and developers can enter any custom endpoint URL, test the connection via a live ping to `/api/health`, and review real latency metrics.

### Expected Backend Contract

If an external backend service is connected, it should implement the following endpoints:

1. **`GET /api/health`**
   * Verifies service liveness and reachability.
   * Expected response: `{ "status": "ok" }` (HTTP 200)

2. **`GET /api/students`**
   * Returns list of registered student candidates.
   * Expected response: Array of `StudentProfile` objects or `{ "students": [...] }`

3. **`GET /api/graph?threshold=2`**
   * Returns network topology.
   * Expected response: `{ "nodes": [...], "edges": [...] }`

4. **`POST /api/match`**
   * Receives search request:
     ```json
     {
       "name": "Demo Student",
       "skills": ["Python", "AI/ML"],
       "interests": ["Education", "AI"],
       "goal": "Build an AI learning assistant",
       "role": "AI/ML"
     }
     ```
   * Expected response:
     ```json
     {
       "recommendations": [
         {
           "id": "diya",
           "name": "Diya",
           "score": 92,
           "skills": ["UI/UX", "Figma", "Wireframing"],
           "interests": ["Education", "Design"],
           "role": "Designer",
           "goal": "accessible learning apps",
           "reasons": [
             "Role Synergy: Diya's focus as Designer balances your AI/ML role for an end-to-end hackathon build.",
             "Shared Vision: Mutual excitement around Education ensures aligned project motivation.",
             "Fills Skill Gaps: Adds UI/UX & Figma to your stack without redundant overlap."
           ],
           "complementarySkills": ["UI/UX", "Figma", "Wireframing"],
           "missingRoleAddressed": "Designer"
         }
       ]
     }
     ```
   * *Note: The client safely supports either `{ recommendations: [...] }` or `{ matches: [...] }`.*

---

## 🧪 Interactive Testing Checklist

Use this checklist during live competition evaluation:

### 1. Main Navigation & Navigation Links
- [ ] Click **Dashboard**: Displays hero metrics, profile submission form, recommendations area, and network graph.
- [ ] Click **Explore Network**: Jumps directly to the dedicated full-screen graph view with the 12 student cards.
- [ ] Click **My Profile**: Opens the focused profile editor.
- [ ] Click **Backend Config** / **Demo Mode**: Opens the API diagnostics modal.

### 2. Profile Creation & Matching
- [ ] **Validation check**: Click "Find My Team" with an empty form to observe accessible validation highlights for missing fields.
- [ ] **Secondary Button ("Load Demo Profile")**: Click "Load Demo Profile" or select a preset (e.g. *Elena Rostova*). The form populates with name, skills, interests, role, and goal.
- [ ] **Interactive Chips**: Click popular skill tags (e.g., `+ React`, `+ Python`) or domain interests to toggle them, or add custom tags with the "Add" button.
- [ ] **Primary Button ("Find My Team")**: Submits the profile, displays a loading state, and computes top 3 ranked recommendation cards.
- [ ] **Reset Button ("Reset Form")**: Clears form fields, search recommendations, and restores graph to base demo cohort.

### 3. Recommendation Cards & Explainability
- [ ] **Exclusion Check**: Verify that the current user is never listed as their own match.
- [ ] **Score & Labeling**: Check that the match score is displayed out of 100 with an explicit label indicating illustrative demo scoring.
- [ ] **Synergy Reasons**: Each card provides 2–3 concrete, human-readable bullet points detailing role synergy, shared interests, and skill gap filling.
- [ ] **Locate in Network**: Click "Locate in Network Graph" on any recommendation to automatically scroll down and center on that student's node in Cytoscape.
- [ ] **Invite to Squad**: Click "Invite to Squad" to trigger affirmative state transition ("Invite Sent") and toast feedback.

### 4. Cytoscape Network Graph
- [ ] **Canvas Rendering**: 12 distinct student nodes color-coded by role (AI/ML: purple, Designer: rose, Frontend: cyan, Backend: emerald, Data: amber, Product: violet).
- [ ] **Zoom / Pan**: Use the `+` and `-` buttons or trackpad gestures to zoom and pan.
- [ ] **Fit to Screen**: Click the maximize button to re-center all nodes.
- [ ] **Reset Layout**: Click the reset circular arrow to rerun the physics layout.
- [ ] **Threshold Slider**: Adjust from 1 to 4 to filter weaker connections and observe the network declutter.
- [ ] **Role Track Filter**: Click filter buttons (All, AI/ML, Designer, Frontend, etc.) to highlight specific disciplines.
- [ ] **Node Click**: Click any node to highlight its local neighborhood, dim distant nodes, and open the detailed profile modal.

---

## 📊 Demo Mode vs. Live Backend Feature Matrix

| Feature | Standalone Demo Mode (Default) | Connected External Backend |
| :--- | :--- | :--- |
| **Cohort Profiles** | 12 fictional student profiles (`Aarav`, `Diya`, `Kabir`, etc.) | Fetched dynamically from `GET /api/students` |
| **Teammate Matching** | Transparent deterministic local algorithm based on role complementarity, shared interests, and goal keyword alignment | Computed by external model / database via `POST /api/match` |
| **Network Graph** | Computed client-side with Cytoscape.js using role & interest affinity weighting | Dynamic graph fetched from `GET /api/graph` |
| **Explainable Rationales** | 2–3 human-readable reasons generated locally | Returned from backend API engine |
| **Network Status** | Displayed honestly as `Demo Mode` with purple indicator | Displayed honestly as `Backend Connected` with green indicator & latency |
| **Offline / Fallback** | 100% operational offline with zero network dependencies | Automatically falls back to Demo Mode if server fails |
