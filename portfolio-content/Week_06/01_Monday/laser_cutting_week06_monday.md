---
title: "From Screen to Acrylic: Cutting Arthur Morgan"
week: 6
day: "01"
date: "2026-09-28"
---

# From Screen to Acrylic: Cutting Arthur Morgan

*MONDAY, SEPTEMBER 28 · DIGITAL FABRICATION & LASER CUTTING*

This week began with a shift from digital design to physical fabrication. Instead of stopping at an image on a screen, I took an **Arthur Morgan reference image**, converted it into a fabrication-ready illustration, and turned it into an acrylic piece using a **CO₂ laser cutter**.

## What Is Laser Cutting?

**Laser cutting** is a digital fabrication process in which a focused laser is directed along computer-controlled paths to **cut, engrave, or mark material**. The laser delivers concentrated heat to a small area, causing the material to melt, vaporise, burn, or otherwise separate depending on the material and process settings.

The useful part of the process is the digital connection: once the geometry is prepared, the machine can reproduce it accurately without manually tracing or cutting the design.

> **Digital drawing → machine path → controlled heat → physical object.**

## How Laser Processing Is Classified

Laser fabrication can be understood in two ways: by **what the laser is doing to the material** and by **what type of laser source is being used**.

### By Process

**Cutting** follows a vector path and passes through the material to create the final outline.

**Scanning / Engraving** moves the laser across an area to create surface detail rather than cutting completely through the sheet.

Other industrial processes include **marking, ablation, vaporisation, melting and thermal-stress cracking**, depending on the material and application.

### By Laser Type

The main laser families encountered in fabrication are **CO₂, fiber, and Nd-based lasers**. Their wavelength and energy characteristics make them suitable for different materials.

For this project, I used a **CO₂ laser**, which is commonly used for non-metal sheet materials such as acrylic, wood, MDF, paper and certain plastics.

## The Material: Acrylic

Acrylic is a thermoplastic sheet material that works well for laser fabrication when the material is specifically intended for laser processing. It can produce clean, highly visible edges and is available in different finishes.

I produced two versions from the same digital design:

- **Black acrylic** — a solid, high-contrast version.
- **Transparent acrylic** — a translucent version where the background and ambient light became part of the visual appearance.

This was a useful reminder that fabrication is not only about geometry. **Material choice changes the character of the final object.**

## From Image to DXF

The interesting part of this project happened before the laser was even turned on.

I started with a **reference image of Arthur Morgan sourced online**. A normal image file is not a suitable cutting path by itself, so I converted the image into a simplified **illustration** that retained the important visual features while reducing unnecessary detail.

The design was then converted into vector geometry and exported as a **DXF (Drawing Exchange Format)** file.

The complete preparation chain was:

```text
Online Reference Image
        ↓
Illustration / Simplification
        ↓
Vector Geometry
        ↓
DXF
        ↓
RDWorks V8
        ↓
Scan + Cut Operations
        ↓
CO₂ Laser Cutter
        ↓
Acrylic Prototype
```

## RDWorks V8: Turning Geometry into a Machine Job

I used **RDWorks V8** to prepare the DXF for fabrication. The software acted as the bridge between the vector drawing and the laser machine.

I imported the DXF, positioned the design on the material, and assigned different regions to different processing modes.

The two important modes I worked with were:

- **Scan** — used for engraving / surface detail.
- **Cut** — used for following vector outlines and cutting through the acrylic.

This separation was important because the final piece was not simply a silhouette. It combined **surface information with a physical cut boundary**.

## What Actually Controls a Laser Cut?

A laser cutter is precise, but it is not magic. The result depends on the relationship between several parameters.

**Power** determines how much energy reaches the material.

**Speed** determines how long the laser interacts with a given point.

**Focus** controls how concentrated the laser spot is.

**Material thickness and composition** determine how the sheet responds to the heat.

**Air assistance and ventilation** affect the cutting environment, smoke removal, and edge quality.

For dimension-critical fabrication, **kerf** also matters. The laser removes a finite amount of material along the path, so the programmed line is not infinitely thin.

## Advantages I Saw in the Process

Laser cutting made it possible to move quickly from a digital illustration to a physical acrylic object. The process offers **repeatability, detailed geometry, fast prototyping, and a highly digital workflow**. It is particularly effective for sheet materials where the required result is fundamentally planar.

## Limitations I Noticed

The same process has constraints. Laser cutting is **material-dependent**, generates heat and fumes, and can produce melted or heat-affected edges. The machine also requires appropriate ventilation, material verification and safe operating practices.

Most importantly, the design has to be prepared for the machine. A photograph that looks perfect on a display can be useless as a cutting file until its information is converted into geometry the laser can actually interpret.

## The Two Results

The same DXF geometry produced two different physical outcomes:

| Variant | Material | Visual Character |
|---|---|---|
| **01** | Black Acrylic | Strong, solid contrast |
| **02** | Transparent Acrylic | Light, translucent appearance |
![[ARTHUR SWartz.jpeg]]

![[Arthur White.jpeg]]
The geometry stayed constant; the **material changed the visual result**.

## What I Took Away

The biggest lesson from this exercise was that **digital fabrication begins long before the machine starts**. The real work was translating an image into a fabrication language: simplifying it, vectorising it, choosing what should be scanned and what should be cut, and then selecting a material that could reproduce the intended result.

The laser cutter did not replace the design process. It exposed whether the design was actually ready to become physical.

> **A screen shows what a design looks like. Fabrication reveals whether the design works.**
