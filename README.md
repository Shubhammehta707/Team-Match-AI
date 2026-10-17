# TeamMatch AI

> **Hackathon prototype:** A graph-powered platform concept that helps
> students discover complementary teammates for projects and hackathons.

## 1. Overview

Finding a good project team is about more than finding people with the
same interests. A balanced team may need people with different
strengths---such as AI/ML, frontend development, backend development,
design, research, data, and testing.

**TeamMatch AI** represents students and their connections to skills,
interests, and projects. It recommends potential teammates, explains why
a match may be useful, and visualizes relationships in an interactive
graph.

**Primary challenge category:** Applying graph-based reasoning to
improve a solution.

Related challenge areas include representing connected entities,
querying connected information, discovering patterns, and demonstrating
the value of graph data.

## 2. Problem

Students can struggle to find teammates whose skills complement their
own. Basic profile searches may overlook relationships between people,
shared project interests, and missing roles within a team.

## 3. Proposed solution

TeamMatch AI is designed to:

-   Collect a student's skills, interests, project goal, and preferred
    role.
-   Recommend up to three potential teammates.
-   Show an illustrative match score and explainable reasons.
-   Visualize relationships between students, skills, interests, and
    projects.
-   Support a demo mode so the prototype can be shown even when a
    backend is unavailable.

> **Implementation note:** This README describes the intended prototype.
> Mark a feature as implemented only after testing it in the current
> project. Backend, Neo4j, and AI-model integration status must be
> verified by the team.

## 4. Key features

-   Student profile form
-   Teammate recommendation cards
-   Explainable match reasons
-   Interactive student relationship graph
-   Fictional demo dataset of 12 students
-   Backend API integration, if configured and verified
-   Demo fallback when the backend is unavailable

## 5. Graph approach

A graph represents entities as **nodes** and their relationships as
**edges**. This makes it possible to explore how students connect
through skills, interests, and projects.

### Example graph model

``` cypher
(:Student)-[:HAS_SKILL]->(:Skill)
(:Student)-[:INTERESTED_IN]->(:Interest)
(:Student)-[:WORKING_ON]->(:Project)
```

For example, a student interested in building an AI learning assistant
may benefit from connecting with an AI/ML student, a frontend developer,
a designer, and a researcher.

A graph visualization alone does not prove graph-based reasoning is
being used. To demonstrate the graph challenge convincingly, the team
should show at least one real graph query or a matching step that uses
graph relationships.

## 6. Matching approach

A possible explainable scoring model can consider:

-   Complementary skills
-   Relevant shared interests
-   Alignment with the project goal

The team should document the actual weights and logic used in the
application. Any example score is an **illustrative match score**, not a
scientifically validated probability of team success. A student's own
profile must never appear as their own recommendation.

## 7. Demo dataset

The prototype uses fictional profiles for demonstration only.

  ID    Name     Role       Example skills
  ----- -------- ---------- ---------------------------------------
  S01   Aarav    AI/ML      Python, AI/ML, Data Analysis
  S02   Diya     Designer   UI/UX, Figma, Wireframing
  S03   Kabir    Frontend   JavaScript, React, CSS
  S04   Meera    Research   Research, Documentation, Presentation
  S05   Rohan    Backend    Node.js, APIs, JavaScript
  S06   Anaya    Data       Python, Data Visualization, SQL
  S07   Ishaan   Frontend   React, JavaScript, Git
  S08   Sara     Designer   Figma, UI/UX, Prototyping
  S09   Vivaan   AI/ML      Python, Machine Learning, APIs
  S10   Nisha    QA         Testing, Documentation, Research
  S11   Arjun    Database   Neo4j, Cypher, Node.js
  S12   Kiara    Product    Product Planning, Pitching, Research

All profiles are fictional and should not be presented as real users.

## 8. Expected API contract

The following endpoints are the shared integration target. Confirm which
ones are actually implemented and tested before describing them as
operational.

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/api/health`           Report service status
                                                  and actual operating
                                                  mode

  GET                     `/api/students`         Return student profiles

  GET                     `/api/graph`            Return graph nodes and
                                                  edges

  POST                    `/api/match`            Return matching
                                                  recommendations
  -----------------------------------------------------------------------

### Student object

``` json
{
  "id": "S01",
  "name": "Aarav",
  "skills": ["Python", "AI/ML"],
  "interests": ["Education", "AI"],
  "goal": "Build an AI learning assistant",
  "role": "AI/ML"
}
```

### Match request example

``` json
{
  "name": "Demo Student",
  "skills": ["Python", "AI/ML"],
  "interests": ["Education", "AI"],
  "goal": "Build an AI learning assistant",
  "role": "AI/ML"
}
```

### Recommendation fields

Each recommendation should include:

-   `id`
-   `name`
-   `score` --- a number from 0 to 100
-   `skills`
-   `interests`
-   `role`
-   `reasons` --- specific explanations grounded in the profile data

The exact response wrapper (for example, `recommendations` or `matches`)
must be agreed between the frontend and backend and documented
consistently. Graph edges must reference valid node IDs.

## 9. Technology stack

Record the technologies that are actually present in the generated
application:

-   **Frontend:** React (planned; verify in the project)
-   **Graph visualization:** Cytoscape.js or the library actually used
-   **Backend:** Record the server-side runtime actually generated
-   **Graph database:** Neo4j Aura, only if configured and successfully
    tested
-   **Matching logic:** Record whether the current version uses
    deterministic scoring, an AI model, or both

Do not publish database credentials, API keys, or secrets in frontend
code or this README.

## 10. Setup and running

Follow the run instructions generated by the actual project. The
commands below are examples only; use them only if they match the
project's files and package scripts.

``` bash
# Move into the project directory
cd <your-project-directory>

# Install dependencies, if the project uses npm
npm install

# Start the app, using the script defined in package.json
npm run dev
```

If the project is hosted in Google AI Studio, use its available preview
and run workflow instead of assuming these commands apply.

### API configuration

Configure the frontend's API base URL in the project's designated
configuration location. Use a backend URL reachable from the machine
running the frontend.

**Important:** `localhost` refers to the current machine. A backend
running on one team member's Mac is not automatically reachable through
`localhost` on another member's Mac. Use a reachable shared URL or stay
in clearly labelled demo mode.

### Neo4j configuration (if implemented)

Keep credentials in server-side environment variables or the platform's
secret manager. Common variable names are:

``` text
NEO4J_URI=
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=
NEO4J_DATABASE=neo4j
```

These are variable names, not actual credentials. Never commit real
secrets to Git or place them in browser-side code.

## 11. Testing checklist

Before the demo, verify each applicable item:

-   [ ] The app opens without runtime errors.
-   [ ] Demo profile loading works.
-   [ ] The main matching action returns up to three recommendations.
-   [ ] The current student is excluded from their own matches.
-   [ ] Scores remain between 0 and 100.
-   [ ] Explanations correspond to the displayed data.
-   [ ] Graph nodes and edges use valid IDs.
-   [ ] Graph interactions work as intended.
-   [ ] Empty or invalid input is handled clearly.
-   [ ] Backend failures show a truthful status and demo fallback, if
    supported.
-   [ ] The app never reports a database as connected unless that
    connection is verified.
-   [ ] The app remains usable at laptop screen size.

Only mark a test complete after running it.

## 12. Team responsibilities

  -----------------------------------------------------------------------
  Member                              Responsibility
  ----------------------------------- -----------------------------------
  Member 1                            Backend, API contract, and Neo4j
                                      integration

  Member 2                            Frontend, recommendation UI, and
                                      graph visualization

  Member 3                            Shared dataset, integration
                                      testing, bug tracking, and
                                      presentation
  -----------------------------------------------------------------------

## 13. Limitations and responsible claims

-   Demo profiles are fictional.
-   Match scores are illustrative and are not validated probabilities.
-   Database and backend connectivity must be verified in the running
    application.
-   The usefulness of recommendations should be evaluated with real
    users before making claims about effectiveness.
-   Only collect profile information needed for matching and handle real
    student data responsibly.

## 14. Future improvements

-   Test recommendations with real student feedback.
-   Improve team-balance suggestions using graph queries.
-   Explain which skills or relationships influenced each
    recommendation.
-   Add privacy-conscious profile management.
-   Evaluate whether recommendations help create balanced teams.

## 15. Project status

Update this section before presenting:

-   **Frontend:** Pending team verification
-   **Backend API:** Pending team verification
-   **Neo4j connection:** Pending team verification
-   **Graph-based reasoning:** Pending team verification
-   **End-to-end testing:** Pending team verification

------------------------------------------------------------------------

**TeamMatch AI --- Find your people. Build something great.**
