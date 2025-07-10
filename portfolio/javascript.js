let canvas, ctx;
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false;


function decodeHTML(html) {
 const txt = document.createElement("textarea");
 txt.innerHTML = html;
 return txt.value;
}


document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".project a").forEach((link) => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const project = this.closest(".project");
            openModal(project);
        });
    });

    canvas = document.getElementById("pdfCanvas");
    if (canvas) {
        ctx = canvas.getContext("2d");
    }
});

function openModal(project) {
    const modal = document.getElementById("projectModal");
    const isEnergy = (project.dataset.title || "").toLowerCase().includes("energy");
  const isERP = (project.dataset.title || "").toLowerCase().includes("erp");
  const isZalando = (project.dataset.title || "").toLowerCase().includes("zalando");

    // Titel
    const mainTitle = document.getElementById("modalTitle");
    mainTitle.textContent = project.dataset.title || "";

    // Overview
    const secOvr = document.getElementById("sectionOverview");
    const ovrTitle = document.getElementById("modalOverviewTitle");
    const ovrDesc = document.getElementById("modalDescription");
    const desc = project.dataset.description || "";
    if (desc) {
        ovrTitle.textContent = project.dataset.overviewTitle || "Overview";
        ovrDesc.innerHTML = desc;
        secOvr.style.display = "block";
    } else {
        secOvr.style.display = "none";
    }

    // Challenge
    const secChal = document.getElementById("sectionChallenge");
    const chalTitle = document.getElementById("modalChallengeTitle");
    const chalDesc = document.getElementById("modalChallenge");
    const chal = project.dataset.challenge || "";
    if (chal) {
        chalTitle.textContent = project.dataset.challengeTitle || "Challenge";
        chalDesc.innerHTML = chal;
        secChal.style.display = "block";
    } else {
        secChal.style.display = "none";
    }

    // Solution
const secSol = document.getElementById("sectionSolution");
const solTitle = document.getElementById("modalSolutionTitle");
const solDesc = document.getElementById("modalSolution");
const sol = project.dataset.solution || "";
const code = project.dataset.code || "";

if (sol) {
  solTitle.textContent = project.dataset.solutionTitle || "Solution";
  solDesc.innerHTML = decodeHTML(sol);

  solDesc.querySelectorAll("code").forEach(codeEl => {
    Prism.highlightElement(codeEl);
  });

  secSol.style.display = "block";
} else {
  secSol.style.display = "none";
}

const codeContainer = document.getElementById("modalSolutionCode");
if (code) {
  
codeContainer.innerHTML = `
 <div class="code-block">
 <div class="code-title">Notebook in Databricks to proccess new rows each day</div>
 <pre><code class="language-python">${decodeHTML(code)}</code></pre>
</div>
`;

  const codeElement = codeContainer.querySelector("code");
  if (codeElement) {
    Prism.highlightElement(codeElement);
  }
} else {
  codeContainer.innerHTML = "";
}

// Energy styling
if (isEnergy) {
  codeContainer.classList.add("energy-code");
} else {
  codeContainer.classList.remove("energy-code");
}



    // Results
    const secRes = document.getElementById("sectionResults");
    const resTitle = document.getElementById("modalResultsTitle");
    const resList = document.getElementById("modalResults");
    const res = project.dataset.results || "";
    if (res) {
        resTitle.textContent = project.dataset.resultsTitle || "Results";
        resList.innerHTML = res.split("|").map(r => `<li>${r.trim()}</li>`).join("");
        secRes.style.display = "block";
    } else {
        secRes.style.display = "none";
    }

    // Media
    const secMed = document.getElementById("sectionMedia");
    const medTitle = document.getElementById("modalMediaTitle");
    const carousel = document.getElementById("modalCarousel");
    carousel.innerHTML = "";

    let imgs = [];
    let caps = [];
    try {
        imgs = project.dataset.images ? JSON.parse(project.dataset.images) : [];
        caps = project.dataset.imageCaptions ? JSON.parse(project.dataset.imageCaptions) : [];
    } catch (e) {
        console.error('Error parsing images or captions JSON:', e);
    }

    document.querySelectorAll('.zalando-image-figure').forEach(el => el.remove());
    document.querySelectorAll('.energy-image-figure').forEach(el => el.remove());


if (imgs.length) {
    medTitle.textContent = project.dataset.mediaTitle || "Screenshots";

    imgs.forEach((src, i) => {
        const fig = document.createElement("figure");
        fig.classList.add("modal-img-figure");

        const img = document.createElement("img");
        img.src = src;
        img.classList.add("modal-img");

        // Special image sizing
        if (src.includes("erp.png")) {
            fig.classList.add("erp-figure");
            img.classList.add("erp-image");
        }
        if (src.includes("process.png")) {
            fig.classList.add("process-figure");
            img.classList.add("process-image");
        }

        // Project-specific styling
        if (isZalando) {
            fig.classList.add("zalando-image-figure");
            img.classList.add("zalando-image");
        }
        if (isEnergy) {
            fig.classList.add("energy-image-figure");
            img.classList.add("energy-image");
        }

        fig.appendChild(img);

        const text = caps[i];
        if (text) {
            const cap = document.createElement("figcaption");
            cap.textContent = text;
            if (isEnergy) {
                cap.classList.add("energy-caption");
            }
            fig.appendChild(cap);
        }

      
        carousel.appendChild(fig);
    });

secMed.style.display = "block";

if (isZalando) {
  secMed.classList.add("zalando-layout");
} else {
  secMed.classList.remove("zalando-layout");
}

if (isEnergy) {
  secMed.classList.add("energy-layout");
} else {
  secMed.classList.remove("energy-layout");
}

if (isEnergy) {
  codeContainer.parentNode.insertBefore(secMed, codeContainer);
} else if (isERP) {
  secOvr.insertAdjacentElement("afterend", secMed);
} else if (isZalando) {
  const pdfViewer = document.querySelector(".pdf-viewer");
  pdfViewer.insertAdjacentElement("afterend", secMed);
}


} else {
    secMed.style.display = "none";
}


    // PDF
    const pdfViewer = document.querySelector(".pdf-viewer");
    const pdfUrl = project.dataset.pdf;
    if (pdfUrl) {
        loadPdf(pdfUrl);
        if (pdfViewer) pdfViewer.style.display = "block";
    } else {
        if (pdfViewer) pdfViewer.style.display = "none";
        clearPdfCanvas();
    }

    // Visa modal
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("projectModal");
    modal.style.display = "none";
    document.getElementById("modalCarousel").innerHTML = "";
    clearPdfCanvas();
    pdfDoc = null;
    pageNum = 1;
    pageRendering = false;
}

function clearPdfCanvas() {
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
    }
}

window.onclick = function (event) {
    const modal = document.getElementById("projectModal");
    if (event.target === modal) {
        closeModal();
    }
};

function loadPdf(url) {
    pdfjsLib.getDocument(url).promise.then(doc => {
        pdfDoc = doc;
        pageNum = 1;
        renderPage(pageNum);
        document.getElementById('pageCount').textContent = doc.numPages;
    }).catch(err => {
        console.error('Error loading PDF:', err);
        pdfDoc = null;
        clearPdfCanvas();
    });
}

function renderPage(num) {
    if (!pdfDoc) return;

    pageRendering = true;
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
            pageRendering = false;
            document.getElementById('pageNum').textContent = num;
        });
    });
}

function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
}

function nextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
}

document.querySelector('a[href="#about"]').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeModal();
    }
});
