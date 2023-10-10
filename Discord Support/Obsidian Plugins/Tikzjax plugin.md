---
Type: Tutorial
---



# Tikzjax
a graph renderer using LaTex math language



```tikz
\begin{document}
  \begin{tikzpicture}[domain=0:4]
    \draw[very thin,color=gray] (-0.1,-1.1) grid (3.9,3.9);
    \draw[->] (-0.2,0) -- (4.2,0) node[right] {$x$};
    \draw[->] (0,-1.2) -- (0,4.2) node[above] {$f(x)$};
    \draw[color=red]    plot (\x,\x)             node[right] {$f(x) =x$};
    \draw[color=blue]   plot (\x,{sin(\x r)})    node[right] {$f(x) = \sin x$};
    \draw[color=orange] plot (\x,{0.05*exp(\x)}) node[right] {$f(x) = \frac{1}{20} \mathrm e^x$};
  \end{tikzpicture}
\end{document}
```

-----

```tikz
\usepackage{circuitikz}
\begin{document}

\begin{circuitikz}[european, voltage shift=0.5]
\draw (0,0)
to[isource, l=$I_0$, v=$V_0$] (0,3)
to[short, -*, i=$I_0$] (2,3)
to[R=$R_1$, i>_=$i_1$] (2,0) -- (0,0);
\draw (2,3) -- (4,3)
to[R=$R_2$, i>_=$i_2$]
(4,0) to[short, -*] (2,0);
\end{circuitikz}

\end{document}
```

```tikz
\usepackage{circuitikz}
\begin{document}
\begin{circuitikz}[european]
\draw
  (0,0) to [short, *-] (6,0)
  to [D, l_=$\mathrm{j}{\omega}_m \underline{\psi}^s_R$] (6,2) 
  to [R, l_=$R_R$] (6,4) 
  to [short, i_=$i2$] (5,4) 
  (0,0) to [open, v^>=$V2$] (0,4) 
  to [short, *- ,i=$\underline{i}^s_s$] (1,4) 
  to [R, l=$R_s$] (3,4)
  to [american inductor, l=$L_{\sigma}$, v=$V3$] (5,4) 
  to [short, i_=$\underline{i}^s_M$] (5,3) 
  to [L, l_=$L_M$] (5,0); 
\end{circuitikz}
\end{document}
```
```tikz
\usepackage{circuitikz}
\begin{document}
\begin{circuitikz}[european]
\draw
(0,2) to [short] (2,2)
to [D] (2,0)
to [short,*-] (0,0);
\end{circuitikz}
\end{document}

```

## Circuitikz
### Syntax


#### Objects
R = Resistor
C = Capacitor
L = Inductor
short = line (no object)

#### arguments
l=$Text$ = Kenzeichnung


[[pgf-Tikzjax-manual.pdf]] Seite 608


---
```tikz
\usepackage{pgfplots}
\pgfplotsset{compat=1.16}

\begin{document}

\begin{tikzpicture}
\begin{axis}[colormap/viridis]
\addplot3[
	surf,
	samples=18,
	domain=-3:3
]
{exp(-x^2-y^2)*x};
\end{axis}
\end{tikzpicture}

\end{document}
```
---
```tikz
\usepackage{tikz}
\usetikzlibrary{positioning}
\begin{document}
\begin{tikzpicture}[
roundnode/.style={circle, draw=black!60, fill=Black!50, very thick, minimum size=7mm},
squarednode/.style={rectangle, draw=red!60, fill=red!50, very thick, minimum size=5mm},
]
%Nodes
\node[squarednode]      (maintopic)                              {2};
\node[roundnode]        (uppercircle)       [left=of maintopic] {1};
\node[squarednode]      (rightsquare)       [right=of maintopic] {3};
\node[roundnode]        (lowercircle)       [below=of maintopic] {4};

%Lines
\draw[->] (uppercircle.east) -- (maintopic.west);
\draw[->] (maintopic.east) -- (rightsquare.west);
\draw[->] (rightsquare.south) .. controls +(down:7mm) and +(right:7mm) .. (lowercircle.east);
\end{tikzpicture}
\end{document}
```

