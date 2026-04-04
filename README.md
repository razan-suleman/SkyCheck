# SkyCheck - Can I Stargaze?

I opened a website to check if tonight was good for stargazing… and it asked me to pay
For the sky.
So instead of paying, I did what any reasonable person would do — I built my own.

## What it does

SkyCheck is a web app that answers one question:

**Is tonight a good night to stargaze?**

It combines multiple data sources and gives a simple, reliable answer, along with detailed breakdowns:

* **Stargazing score (0–100)** based on real conditions
* **Moon phase + illumination** (huge impact on visibility)
* **Cloud cover, humidity, precipitation, wind**
* **Visible planets (with position data)**
* **ISS pass times**
* **Hourly breakdown for tonight**
* **7-day forecast**

---

## 🧠 Core idea

Instead of showing raw weather data and making the user interpret it, the app translates everything into a single score:

```
Score = 100 - (cloud + humidity + precipitation + wind + moon penalties)
```

Each factor is weighted based on how much it affects visibility. For example:

* Cloud cover has the highest impact
* Any precipitation immediately drops the score
* High moon illumination reduces visibility of faint objects

## Architecture

The project is built with a clean separation of concerns:

* **Frontend**: React (component-based, modular UI)
* **API layer**:

  * Weather (Open-Meteo)
  * Geocoding (location search + browser geolocation)
  * ISS data
* **Utils layer**:
  * Astronomy calculations (moon phase, planets)
  * Scoring system (pure functions)
  * Weather processing

Key design decisions:
* Keep **business logic independent from UI**
* Use **pure functions** for calculations → easy to test
* Break UI into **small reusable components**
* Avoid unnecessary complexity — simple but scalable

## Why this is useful

Most weather apps give you data.

This gives you a **clear answer**.

Instead of asking:

> “Is 63% humidity + 40% clouds okay?”

You get:

> “Score: 78 → good conditions”

---

## What I like about it

* It solves a real, small problem I personally had
* It’s practical — I actually use it
* It forced me to think about:
  * translating raw data → decisions
  * designing scoring systems
  * structuring a clean frontend app

