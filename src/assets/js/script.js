// Function

// Makes some ajax request with a link and his data.
function ajax_request(link, method, data, success = null, failed = null) {
    // Creating a new "xml http request" and Opens the xhr with the passed parameters.
    let xhr = new XMLHttpRequest(); xhr.open(method, link, true);
    // Changes the default header.
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    // Sends the passed data.
    xhr.send(JSON.stringify(data)); xhr.onload = () => {
        // A 200 status has been returned.
        if (xhr.status === 200) success(JSON.parse(xhr.responseText), xhr.status);
        // Otherwise.
        else failed(xhr.status);
    }
}

/**
 * 
 * @param {*String Parent Bloc where message will be display} bloc 
 * @param {*String  Message to display} message 
 */
function displayWaitingMsg(bloc, message) {
    let loaderCode = '<div id="waiting-message">\
    <div id="loader" class="loader"></div>\
    <div id="message" class="meessage">' + message + '</div></div>'

    document.querySelector(bloc).innerHTML = loaderCode;
}
/**
 * This function get all categories of templates
 * @returns All categories of template
 */
function getCategories() {
    // Use promise
    return new Promise((resolve, reject) => {
        // Ajax request 
        ajax_request('http://localhost:3000/api/categories', "GET",
            new Object({}),
            data => { resolve(data) },
            error => { reject(error) })
    });
}

/**
 * 
 * @param {*Number, Id of category} id_category 
 * @returns All templates of this category
 */
function getTemplatesByCategory(id_category) {
    // Use promise
    return new Promise((resolve, reject) => {
        // Ajax request 
        ajax_request(`http://localhost:3000/api/category/${id_category}`, "GET",
            new Object({}),
            templates => { resolve(templates) },
            error => { reject(error) })
    });
}

/**
 * This function get all templates from database
 * @returns All templates from database
 */
function getAllTemplates() {
    // Use promise
    return new Promise((resolve, reject) => {
        // Ajax request 
        ajax_request(`http://localhost:3000/api/templates`, "GET",
            new Object({}),
            templates => { resolve(templates) },
            error => { reject(error) })
    });
}


function buildCategoriesView(categories) {
    // Init var contain html view code
    let viewCode = '<div class="d-flex align-items-center justify-content-around categories-list">';
    for (category of categories) {
        // Check if category is active
        if (category.active) {
            viewCode += `<div id="category-${category.id}" class="category-name category-name-active">${category.name}</div>`
        } else {
            // If is not active
            viewCode += `<div id="category-${category.id}" class="category-name">${category.name}</div>`
        }
    }
    viewCode += '</div>';
    return viewCode;
}

function buildTemplatesView(arrayOfTemplates) {
    // Init var
    let viewCode = '<div class="catalog-row">';
    for (let index = 0; index < arrayOfTemplates.length; index++) {
        const template = arrayOfTemplates[index];

        viewCode += `<!-- Single template -->
        <div class="single-template">
            <!-- Cover template -->
            <div class="cover-template" style="background-image: url('http://${template.path_cover}');"></div>
            <!-- Info & Cmd Panel -->
            <div class="info-cmd-panel">
                <!-- Template name -->
                <div class="template-name">${template.name}</div>
                <!-- Price and info btn -->
                <div class="price-info-btn">
                    <!-- Info btn -->
                    <a  title="${template.description}" class="info-template-btn"> <span class="bi-info-circle"></span> Info</a>
                    <!-- Price -->
                    <div class="price-template">${template.price}</div>
                </div>
                <!-- cmd Btn -->
                <div class="cmd-btn-panel">
                    <!-- Edit btn -->
                    <a href="http://localhost:3000/edit-template/?templateId=${template.id_temp}" class="cmd-btn edit-btn">Modifier</a>
                    <!-- Demo Btn -->
                    <a href="${template.path_demo}" class="cmd-btn">Voir</a>
                </div>
            </div>
        </div>`

        // Display 3 templates on one row
        if ((index + 1) % 3 == 0) {
            viewCode += '</div><div class="catalog-row">'
        }
    }

    return viewCode;
}

function displayTemplates(category) {
    if (category.active) {
        // Display waiting message
        displayWaitingMsg('#template-area', "Chargement...");
        // Get templates for this category
        category.to_Exec().then(
            templates => {
                // Style for active category
                document.getElementById(`category-${category.id}`).classList.add('category-name-active');
                // Display active category name
                document.getElementById('active-category').innerHTML = category.name;
                // Display templates
                document.getElementById('template-area').innerHTML = buildTemplatesView(templates);
            },
            error => { console.log(error); }
        )
    }

}

// Page Logic

// displayWaitingMsg('.templates-area', "Chargement des templates")
displayWaitingMsg('#category-list', "Chargement des catégories")


// Manage display categories on top header

// Init categories var with all categories
let categories = [
    {
        id: "all", // Id of category in database
        name: "Tout les templates", // Category Name
        description: "Toutes les templates disponibles sur HTemplates", // Description of one category
        active: true, // Status of template
        to_Exec: () => { // This function will execute if category is active on page
            // First Get all templates of this category
            return new Promise((resolve, reject) => {
                getAllTemplates().then(
                    // If all templates is ready
                    templates => { resolve(templates) },
                    // Otherwise
                    errorToGet => { reject(errorToGet) }
                )
            });
        }
    }
];

// Get Categories from bdd
getCategories().then(
    // If all categories is ready
    success => {
        // Read each category wwith loop
        for (let category of success.data) {
            // Push each, array of categorie
            categories.push({
                id: category.id_cat, // Id of category in database
                name: category.categorie, // Category Name
                description: category.description, // Description of one category
                active: false, // Status of template
                to_Exec: () => { // This function will execute if category is active on page
                    // First Get all templates of this category
                    return new Promise((resolve, reject) => {
                        getTemplatesByCategory(category.id_cat).then(
                            // If all templates is ready
                            templates => { resolve(templates) },
                            // Otherwise
                            errorToGet => { reject(errorToGet) }
                        )
                    });
                }
            });
        }

        // After all categories are ready, display there on page
        document.getElementById('category-list').innerHTML = buildCategoriesView(categories);
        categories.map((category) => { displayTemplates(category); });

        // Listen Change of category
        categories.map(category => {
            document.getElementById(`category-${category.id}`).addEventListener('click', () => {
                category.active = true;
                displayTemplates(category);

                // Disable active category style
                for (let cat of categories) {
                    if(cat.id != category.id)
                        document.getElementById(`category-${cat.id}`).classList.remove('category-name-active');
                }
            });
        });

    },
    error => { console.log(error) }
);
