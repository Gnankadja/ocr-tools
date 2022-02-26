import { navigateTo } from "../js/script.js";

export class AppViews {
  constructor(title, contentHTML) {
    this.title = "Template Editor";
    this.contentHTML = '<!-- Main Block -->\
    <div class="main-bloc d-flex">\
        <!-- Lateral block -->\
        <div class="d-flex flex-column lateral-bloc">\
            <!-- Info Template Editor -->\
            <div class="info-template-editor d-flex flex-column">\
                <!-- Header Bar -->\
                <div class="lateral-bloc-header d-flex justify-content-between align-items-center">\
                    <!-- Logo -->\
                    <div class="logo d-flex justify-content-center align-items-center"><span>template-</span>\
                        <span>-editor</span>\
                    </div>\
                    <!-- Exit Button -->\
                    <div class="bi-arrow-left-square" id="logout-session"></div>\
                </div>\
                <!-- Site Description -->\
                <div class="site-description">Editez et personnalisez votre template avant de le télécharger.</div>\
                <!-- How it works messsage-->\
                <div class="how-it-works-msg">Pour chaque section de donnée,\
                    veuillez renseignez les champs que vous souhaitez modifier.\
                    Si vous ne voulez pas modifiez un champs, laissez cette case vide et\
                    continuez. Les champs ayant une bordure sont modifiable.</div>\
            </div>\
            <!-- Edit Forms -->\
            <form id="edit-form" class="d-flex justify-content-center align-items-center flex-column">\
            </form>\
        </div>\
        <!-- Content Block -->\
        <div class="d-flex flex-column content-block">\
            <!-- Content Block Header -->\
            <div class="content-block-header d-flex justify-content-between align-items-center">\
                <!-- Template Name -->\
                <div class="template-name" id="template-name"></div>\
                <!-- Command Button Panel -->\
                <div class="d-flex justify-content-around cmd-btn-panel">\
                    <!-- Edit Image -->\
                    <div class="cmd-btn" id="edit-image-btn"> <span class="bi-image-fill"></span> Editer images </div>\
                    <!-- Save Data Button -->\
                    <div class="cmd-btn" id="save-data"> <span class="bi-save"></span> Enregistrer modification</div>\
                    <!-- Preview Button -->\
                    <div class="cmd-btn preview-btn" id="preview-btn"> <span class="bi-record-btn"></span> Aperçu</div>\
                    <!-- Download Template Button -->\
                    <div class="cmd-btn download-btn" id="download-btn"> <span class="bi-download"></span> Télécharger</div>\
                </div>\
            </div>\
            <!-- Preview Block -->\
            <div class="preview-block">\
                <!-- Responsive Active Button -->\
                <div class="responsive-panel-btn">\
                    <!-- Desktop -->\
                    <li class="bi-laptop-fill" id="laptop-view"></li>\
                    <!-- Tablet -->\
                    <li class="bi-tablet-landscape-fill" id="tablet-view"></li>\
                    <!-- Smartphone -->\
                    <li class="bi-phone-fill" id="smartphone-view"></li>\
                </div>\
                <!-- Live Preview -->\
                <iframe class="" id="live-preview" src=""\
                    frameborder="0"></iframe>\
            </div>\
        </div>\
    </div>\
'
  }
  getContentHTML() {
    return new Promise((resolve, reject) => {
      resolve(this.contentHTML);
    })
  }

  // This code is execute after all edit page is loaded
  execCode() {
    // Get session data
    let sessionData = getDataSession();
    // Dsiplay current template name
    document.getElementById('template-name').innerHTML = sessionData.templateName;
    // After, display waiting message in forms
    displayWaitingMsg('form', 'Chargement des éléments');
    // And get editable data
    getEditableData(sessionData.pathEditFolder).then(
      // If data is get succeful,
      dataSucceful => {
        // Build forms
        buildForms(dataSucceful).then(
          // when forms code is ready, load this in page 
          forms => {
            // Display forms in page
            loadForms(forms)

            // Manage Forms
            observeChange(dataSucceful);

            // Listen Save Data Event
            document.getElementById('save-data').addEventListener('click', () => {
              saveData(sessionData.pathEditFolder).then(
                saveSucceful => {
                  // Reoload edit page to update change
                  navigateTo('/edit-template/app');
                },
                saveFailed => { }
              );
              //loadPreview(sessionData.pathEditFolder);
            })
          },
          // If error to get forms code 
          formsError => { displayWaitingMsg('form', 'Erreur, Actualisez la page.'); }
        );
      },
      dataError => { displayWaitingMsg('form', 'Erreur. Actualisez la page') }
    )
    // Load live preview.
    loadPreview(sessionData.pathEditFolder);

    // Load preview in new tab
    document.getElementById('preview-btn').addEventListener('click', () => {
      previewSite(sessionData.pathEditFolder);
    });

    // Display edit windows to edit all images on html page
    document.getElementById('edit-image-btn').addEventListener('click', ()=>{
      editImage();
    });

    // Display Download Option, after user click on download button
    document.getElementById('download-btn').addEventListener('click', () => {
      // Display Modal box and download option
      modalBox('40%', '85%', downloadBlocView(), 'Options de téléchargement', 'bi-cloud-download-fill');
      // Manage Download option
      manageDownloadOption();
    });

    // Display confirm message before user exit session (If user click on logout icon)
    document.getElementById('logout-session').addEventListener('click', () => {
      destroySession();
    });

    // Display confirm message before user exit session (If user try to close tabs or browser)
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      // remove session data
      // removeDataSession();
    });


    // Manage responsive button
    responsive()
  }
}