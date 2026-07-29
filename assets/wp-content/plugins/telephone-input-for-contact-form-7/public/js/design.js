jQuery(document).ready(function() {
    console.log("ready!");

    jQuery('.telephone_input_class').each(function(index, value) {

        var name = jQuery(this).attr("name");
        var enable_dropdown = jQuery(this).attr("enable_dropdown");

        var inputa = document.querySelector("input[name=" + name + "]");

        window.intlTelInput(inputa, {
            allowDropdown: enable_dropdown,
            utilsScript: telephone_ajax.ajax_urla + "/public/js/utils.js",
        });
    });
});