---
title: "From STL to a Working Wallet"
week: 6
day: "02"
date: "2026-09-29"
---

# From STL to a Working Wallet

*TUESDAY, SEPTEMBER 29 · ADDITIVE MANUFACTURING & 3D PRINTING*

After working with a flat acrylic sheet on the laser cutter, the next exercise moved in the opposite direction: **building a complete three-dimensional object layer by layer**.

I selected a **functional wallet model** from Maker Lab, prepared it in **Bambu Studio**, optimised it for material usage, and sliced it for printing on a **Bambu Lab H2S** using **PLA Basic**.

## What Is 3D Printing?

**3D printing is an additive manufacturing process** in which a digital 3D model is converted into a physical object by creating material one layer at a time.

Instead of starting with a block and removing material, the printer follows a digital toolpath and **adds only the material needed to form the object**.

```text
3D Model
   ↓
Slicing
   ↓
Layer-by-Layer Toolpath
   ↓
Material Deposition / Curing / Fusion
   ↓
Physical Part
```

The important step between the model and the printer is **slicing**. The slicer converts the 3D geometry into the instructions required for the machine: walls, infill, supports, travel moves and layer-by-layer deposition.

## The Major Families of 3D Printing

There are several additive-manufacturing approaches. The simplest way I found to understand them is by looking at the **starting material**.

### Filament — FDM / FFF

A thermoplastic filament is heated and extruded through a nozzle. Material is deposited along a programmed path, layer after layer.

**Examples:** PLA, PETG, ABS, ASA, TPU and nylon-based filaments.

**This is the technology used in my project.**

### Liquid Resin — SLA / DLP / MSLA

Liquid photopolymer resin is selectively cured using light.

**SLA** uses a laser or optical system to cure resin.

**DLP** uses projected light to cure areas of a layer.

**MSLA** uses an LCD mask together with a UV light source.

These processes are especially useful when very fine detail and smooth surfaces are important.

### Powder — SLS / SLM / DMLS

Powder-based processes selectively fuse or sinter material in a powder bed.

**SLS** is commonly used with polymer powders, while **SLM** and **DMLS** are associated with metal additive manufacturing.

These technologies are useful for complex engineering geometries that would be difficult to create through conventional manufacturing.

### Other Approaches

Additive manufacturing also includes **material jetting, binder jetting, sheet lamination, and directed energy deposition (DED)**. These use different combinations of deposited material, powder, sheets, binders, or focused energy.

The terminology can look intimidating at first, but the underlying idea is simple: **change how material exists, control where it goes, and build the object layer by layer.**

## The Machine: Bambu Lab H2S

The printer used for this exercise was the **Bambu Lab H2S**, a large-format, single-nozzle FDM printer.

Bambu Lab specifies a **340 × 320 × 340 mm build volume**, a **350 °C maximum nozzle temperature**, a **120 °C maximum heatbed temperature**, and a **65 °C actively heated chamber**. It supports toolhead speeds up to **1,000 mm/s** and acceleration up to **20,000 mm/s²**. The standard hotend flow specification is **40 mm³/s**. The machine uses a **1.75 mm filament**, includes a **0.4 mm hardened-steel nozzle**, and supports 0.2, 0.4, 0.6 and 0.8 mm nozzle diameters. citeturn276265search0turn276265search12

### Key H2S Specifications

| Specification | Bambu Lab H2S |
|---|---|
| **Printing Technology** | FDM / FFF |
| **Build Volume** | **340 × 320 × 340 mm** |
| **Nozzle Temperature** | **Up to 350 °C** |
| **Heatbed Temperature** | **Up to 120 °C** |
| **Active Chamber** | **Up to 65 °C** |
| **Maximum Toolhead Speed** | **1,000 mm/s** |
| **Maximum Acceleration** | **20,000 mm/s²** |
| **Standard Hotend Flow** | **40 mm³/s** |
| **Filament Diameter** | **1.75 mm** |
| **Included Nozzle** | **0.4 mm hardened steel** |
| **Supported Nozzles** | **0.2 / 0.4 / 0.6 / 0.8 mm** |
| **Extrusion System** | High-precision PMSM extruder motor |
| **Filament Cutter** | Built-in |
| **Chamber Filtration** | G3 pre-filter + H12 HEPA + activated carbon |
| **Monitoring** | Multiple sensors and onboard cameras |
| **Software** | Bambu Studio |

Bambu Lab also highlights the H2S's **23 sensors and three onboard cameras**, along with optional Vision Encoder technology for high-precision motion control. citeturn276265search0

> The headline speed is a machine capability, not a promise that every model should be printed at 1,000 mm/s. Geometry, material, layer height, extrusion flow, cooling and acceleration limits still determine the practical print settings.

## Interactive 3D Model

This is the **3D model used for the printing exercise**, converted from the original STL into a browser-friendly GLB format for interactive inspection.

{{3D_MODEL:Buvanesh.glb}}

You can **drag to rotate**, **scroll to zoom**, and inspect the geometry from different angles. This gives the portfolio entry a direct connection between the digital model and the physical fabrication process.

## Software: Bambu Studio

I used **Bambu Studio** to prepare the wallet for printing.

The slicer was where the digital model became a manufacturing plan. I could change its size, orientation, support strategy, infill, bed adhesion and other parameters before generating the final layers.

## The Wallet Workflow

I chose a **functional wallet model** from Maker Lab rather than a purely decorative object. That changed the goal from "make it look good" to "make it usable while respecting manufacturing constraints."

My workflow was:

```text
Functional Wallet Model
        ↓
Import into Bambu Studio
        ↓
Scale to 90%
        ↓
Check Material Usage
        ↓
Orient Horizontally
        ↓
Add Tree Supports
        ↓
Add Outer Brim
        ↓
Set 10% Grid Infill
        ↓
Slice
        ↓
~2 Hour Print Estimate
```

## Why I Scaled It to 90%

The model was reduced to **90% scale** with the practical goal of keeping the print **under approximately 50 g of material**.

This was more than a cosmetic resize. Scaling changed the relationship between **size, material consumption and print time**.

A useful engineering mindset emerged from this: the best model is not automatically the largest or most detailed one. It is the version that satisfies the purpose while staying inside the available constraints.

## Why Orientation Matters

I oriented the wallet to **lay horizontally** on the build plate.

In FDM printing, orientation affects much more than appearance. It influences:

- layer direction and mechanical behaviour,
- surface finish,
- support requirement,
- print time,
- overhangs,
- and first-layer stability.

For a functional part, orientation should therefore be treated as a **design decision**, not a last-minute slicer adjustment.

## Support Strategy

I used **tree supports** for regions that needed additional support during printing. Instead of creating a dense block of support material, tree supports branch upward toward the unsupported geometry.

I also used an **outer brim** to increase the first-layer contact area around the wallet. This helps improve adhesion and reduce the risk of edge lifting during the print.

## Infill: 10% Grid

The wallet was configured with **10% grid infill**.

Infill controls the internal structure between the outer walls. Increasing it generally increases material use and can increase stiffness; reducing it can save material and time but may reduce structural performance.

For this prototype, **10% grid** provided a lightweight internal structure while keeping material consumption under control.

## Material: PLA Basic

The selected material was **PLA Basic**, a commonly used thermoplastic for prototyping because it is comparatively easy to print and provides good visual quality for general-purpose models.

For this exercise, the material was less about pushing the printer to its temperature limits and more about learning how **geometry and slicer decisions translate into a usable object**.

## The Slice

After the model was scaled, oriented and supported, I sliced it in Bambu Studio.

The slicer estimated a print duration of approximately **2 hours**.

That number represented a complete manufacturing prediction based on the model and the selected process settings. It was useful because it turned abstract design choices into measurable consequences: **how much material, how much time, and what kind of support structure?**

## What I Learned

The biggest difference between 3D printing and laser cutting became clear in this exercise.

With laser cutting, I was preparing a **2D path for material removal or surface marking**.

With 3D printing, I was preparing a **3D geometry for controlled material deposition**.

The common thread was still the same:

> **The digital file is only the starting point. Manufacturing begins when you account for what the machine can physically do.**

The wallet exercise made that idea practical. A 90% scale, horizontal orientation, tree supports, outer brim and 10% grid infill were not random slicer settings. Each one was a response to a constraint — **material usage, stability, geometry, or printability**.

## Fabrication Mindset

This week connected two apparently different machines through one engineering principle:

```text
Design
  ↓
Understand the Process
  ↓
Prepare the Digital File
  ↓
Choose Parameters
  ↓
Fabricate
  ↓
Inspect the Result
  ↓
Iterate
```

The interesting part of digital fabrication is not pressing **Print** or **Start**. It is learning how to make the digital model think in the language of the machine.

### Reference

Bambu Lab, *H2S — The Ultimate Single-Nozzle 3D Printer Now Bigger Than Ever* (official technical overview):
https://blog.bambulab.com/h2s-the-ultimate-single-nozzle-3d-printer-now-bigger-than-ever/
