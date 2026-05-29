# DeepGuard AI — Thesis Report (LaTeX)

This is the LaTeX source for my final-year project thesis.

---

## How to Compile

### Option 1 — VS Code (recommended)
1. Open `main.tex`
2. Press **`Ctrl + Alt + B`** to compile
3. Press **`Ctrl + Alt + V`** to view PDF on the right

### Option 2 — Command Line
```bash
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

> Run pdflatex **twice** at the end so the table of contents and references update properly.

---

## Folder Structure

```
thesis/
├── main.tex                  ← Main file (compile this one)
├── references.bib            ← Bibliography
│
├── config/
│   ├── packages.tex          ← All LaTeX packages
│   ├── settings.tex          ← Margins, colors, boxes, etc.
│   └── commands.tex          ← Custom shortcuts (\deepguard, \tech, etc.)
│
├── frontmatter/
│   ├── cover.tex             ← Cover page
│   ├── dedication.tex        ← Dedication
│   ├── acknowledgments.tex   ← Acknowledgments
│   └── abstract.tex          ← Abstract (English + French)
│
├── chapters/
│   ├── introduction.tex
│   ├── chapter1_context.tex
│   ├── chapter2_analysis.tex
│   ├── chapter3_design.tex
│   ├── chapter4_implementation.tex
│   ├── chapter5_testing.tex
│   └── conclusion.tex
│
└── figures/                  ← Put all images and diagrams here
```

---

## Custom Commands

| Command | Result |
|---|---|
| `\deepguard` | **DeepGuard AI** (bold) |
| `\code{text}` | `text` (blue monospace) |
| `\tech{Python}` | **Python** (purple bold) |
| `\keyword{word}` | **word** (blue bold) |

## Custom Boxes

```latex
\begin{infobox}{Title}
Content here...
\end{infobox}

\begin{notebox}{Note}
Some note...
\end{notebox}

\begin{warningbox}{Warning}
Be careful with this...
\end{warningbox}
```

## Inserting a Figure

```latex
\addfigure{filename.png}{0.8}{Caption of the figure}
```

This inserts an image from `figures/filename.png` at 80% page width.

---

## Notes

- The chapters currently contain `\lipsum` placeholder text — they will be replaced with real content step by step.
- All colors and styles can be edited in `config/packages.tex` and `config/settings.tex`.
- If a package is missing, MiKTeX should auto-install it on first compile (just click "Install" if prompted).

---

**Author:** Mohamed Mbarek
**Supervisor:** Mr. Othmani Mohamed
**University:** Faculty of Sciences of Gafsa
**Year:** 2025–2026
