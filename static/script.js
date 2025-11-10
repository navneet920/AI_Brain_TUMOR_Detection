/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');
const htmlEl = document.documentElement;

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('ui-theme');
if (savedTheme === 'dark') {
  htmlEl.setAttribute('data-theme','dark');
  themeIcon.innerHTML = '<i class="bi bi-sun-fill"></i>';
  themeLabel.textContent = 'Light';
} else {
  htmlEl.setAttribute('data-theme','light');
  themeIcon.innerHTML = '<i class="bi bi-moon-fill"></i>';
  themeLabel.textContent = 'Dark';
}

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  if(current === 'dark') {
    htmlEl.setAttribute('data-theme','light');
    themeIcon.innerHTML = '<i class="bi bi-moon-fill"></i>';
    themeLabel.textContent = 'Dark';
    localStorage.setItem('ui-theme','light');
  } else {
    htmlEl.setAttribute('data-theme','dark');
    themeIcon.innerHTML = '<i class="bi bi-sun-fill"></i>';
    themeLabel.textContent = 'Light';
    localStorage.setItem('ui-theme','dark');
  }
});

/* ---------- Drag & drop + preview ---------- */
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const fileNameEl = document.getElementById('fileName');
const fileSizeEl = document.getElementById('fileSize');

dropArea.addEventListener('click', () => fileInput.click());
['dragenter','dragover'].forEach(evt => dropArea.addEventListener(evt, e=>{e.preventDefault(); e.stopPropagation(); dropArea.classList.add('hover');}));
['dragleave','dragend','drop'].forEach(evt => dropArea.addEventListener(evt, e=>{e.preventDefault(); e.stopPropagation(); dropArea.classList.remove('hover');}));
dropArea.addEventListener('drop', (e)=>{if(e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);});
fileInput.addEventListener('change', (e)=>{if(e.target.files.length) handleFile(e.target.files[0]);});

function handleFile(file){
  if(!file.type.startsWith('image/')){ alert('Upload an image file.'); fileInput.value=''; return; }
  const reader = new FileReader();
  reader.onload = (ev)=>{previewImage.src=ev.target.result; previewArea.style.display='flex'; fileNameEl.textContent=file.name; fileSizeEl.textContent=(file.size/1024).toFixed(1)+' KB';};
  reader.readAsDataURL(file);
}

/* ---------- Form submit spinner ---------- */
const uploadForm = document.getElementById('uploadForm');
const spinner = document.getElementById('spinner');
const submitBtn = document.getElementById('submitBtn');

uploadForm.addEventListener('submit',(e)=>{
  if(!fileInput.files.length){ e.preventDefault(); alert('Please choose an image first.'); return; }
  spinner.style.display='inline-block';
  submitBtn.disabled=true;
  submitBtn.style.opacity=0.8;
});

/* Accessibility: Enter/Space opens file picker */
dropArea.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault(); fileInput.click();}});
