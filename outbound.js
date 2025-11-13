$(document).ready(function () {
    const HEADLINE_DEFAULT = "Contact us",
        HEADLINE_DISCOUNT = "Need a discount?",
        HEADLINE_MAILING_LIST = "Join our mailing list",
        HEADLINE_WAITLIST = "Join our waitlist",
        INTRO_TEXT_WAITLIST =
            "Please join our waitlist for priority access to our super early bird tickets, to be released later this year.",
        SUCCESS_TITLE_MAILING_LIST = "Thank you for joining!",
        SUCCESS_MESSAGE_MAILING_LIST =
            "You have been successfully added to our mailing list.",
        sponsorshipLevels = ["silver", "gold", "platinum", "kickstarter"],
        discountTypes = [
            "discount-startup",
            "discount-ngo-gov",
            "discount-academic",
            "cdr",
        ],
        $formFields = $(".unified-form-field-box"),
        $formBackground = $(".unified-form-background"),
        $formOverlay = $(".unified-form-background-overlay"),
        $formTitle = $("#unified-form-title"),
        $formIntroText = $("#U-Form-Intro-Text"),
        $formTypeField = $("#form-type"),
        $sponsorshipLevelField = $("#sponsorship-level"),
        $form = $("#unified-contact-form"),
        $tabs = $(".unified-form-tab-button"),
        $companyType = $("#U-Company-Type"),
        $successTitle = $("#unified-form-success-title"),
        $successMessage = $("#unified-form-success-message");

    let defaultSuccessTitle = $successTitle.text(),
        defaultSuccessMessage = $successMessage.text();

    let choicesInstances = [];

    function initializeChoices() {
        $("select[multiple]").each(function () {
            const originalElement = this;
            const select = new Choices(originalElement, {
                removeItemButton: true,
                searchEnabled: true,
                placeholder: true,
                placeholderValue: "Select options...",
                classNames: {
                    containerOuter: "choices",
                },
                itemSelectText: "",
                position: "bottom",
                shouldSort: false,
            });

            // Add event listeners for the Choices instance
            select.passedElement.element.addEventListener(
                "addItem",
                checkStartupFields
            );
            select.passedElement.element.addEventListener(
                "removeItem",
                checkStartupFields
            );

            choicesInstances.push(select);
            this.choices = select;
        });
    }

    function updateFieldRequiredStatus() {
        $(".unified-form-field-box").each(function () {
            const isVisible = $(this).is(":visible");
            $(this)
                .find("input, select, textarea")
                .not(':submit, :button, [type="search"]')
                .each(function () {
                    const isRequired = $(this).closest(".required").length > 0;
                    if ($(this).hasClass("choices")) {
                        const values = $(this)[0].choices.getValue();
                        $(this).prop("required", isVisible && values.length === 0);
                    } else {
                        $(this).prop("required", isVisible && isRequired);
                    }
                });
        });
    }

    function checkStartupFields() {
        const organisationTypeElement = document.querySelector(
            "#U-Organisation-Type"
        );
        if (organisationTypeElement && organisationTypeElement.choices) {
            const selectedValues = organisationTypeElement.choices
                .getValue()
                .map((choice) => choice.value);
            const shouldShowStartupFields =
                selectedValues.includes("Start-Up") ||
                selectedValues.includes("Supplier");
            const shouldShowInvestmentFields = selectedValues.includes("Investment");
            const shouldShowBuyerFields = selectedValues.includes("Buyer");

            $("[data-field-type]").each(function () {
                const fieldType = $(this).data("field-type");
                const isStartup = fieldType && fieldType.includes("startup");
                const isInvestment = fieldType && fieldType.includes("investment");
                const isBuyer = fieldType && fieldType.includes("buyer");

                $(this)
                    .toggle(
                        (isStartup && shouldShowStartupFields) ||
                        (isInvestment && shouldShowInvestmentFields) ||
                        (isBuyer && shouldShowBuyerFields)
                    )
                    .find("input, select, textarea")
                    .prop(
                        "required",
                        (isStartup && shouldShowStartupFields) ||
                        (isInvestment && shouldShowInvestmentFields) ||
                        (isBuyer && shouldShowBuyerFields)
                    );
            });
        }
    }

    function updateFormVisibility(formType) {
        $formFields.each(function () {
            const $field = $(this);
            const types = $field.data("form-type")
                ? $field.data("form-type").split(" ")
                : [];
            const shouldBeVisible =
                (types.includes("sponsorships") &&
                    sponsorshipLevels.includes(formType)) ||
                types.includes(formType) ||
                types.includes("all") ||
                (types.includes("discount") && discountTypes.includes(formType));
            $field.toggle(shouldBeVisible);
        });
        updateFormTitleAndBackground(formType);
        updateHiddenFields(formType);
        updateActiveTabs(formType);
        updateFieldRequiredStatus();
        checkStartupFields();
    }

    function checkOtherCdrFields() {
        try {
            const cdrChoices = document.querySelector("#U-CDR-Focus").choices;
            const currentSelections = cdrChoices.getValue();
            const hasOther = currentSelections.some(
                (choice) => choice.value === "Other"
            );

            $('[data-field-type="cdr-other"]').toggle(hasOther);

            updateFieldRequiredStatus();
        } catch (error) {
            console.error("Error in checkOtherCdrFields:", error);
        }
    }

    function updateFormTitleAndBackground(formType) {
        $formBackground.removeClass().addClass("unified-form-background");
        if (sponsorshipLevels.includes(formType)) {
            $formTitle.text(formType.charAt(0).toUpperCase() + formType.slice(1));
            $formBackground.addClass(formType);
        } else if (discountTypes.includes(formType)) {
            $formTitle.text(HEADLINE_DISCOUNT);
        } else if (formType === "mailing-list") {
            $formTitle.text(HEADLINE_MAILING_LIST);
            $successTitle.text(SUCCESS_TITLE_MAILING_LIST);
            $successMessage.text(SUCCESS_MESSAGE_MAILING_LIST);
        } else if (formType === "waitlist") {
            $formTitle.text(HEADLINE_WAITLIST);
            $formIntroText.text(INTRO_TEXT_WAITLIST).show();
        } else {
            $formTitle.text(HEADLINE_DEFAULT);
            $formIntroText.hide();
            $successTitle.text(defaultSuccessTitle);
            $successMessage.text(defaultSuccessMessage);
        }
        if ($formIntroText.data("form-type") !== formType) {
            $formIntroText.hide();
        }
    }

    function updateHiddenFields(formType) {
        if (sponsorshipLevels.includes(formType)) {
            $formTypeField.val("sponsorship");
            $sponsorshipLevelField.val(formType);
            $("#discount-type").val("");
        } else if (discountTypes.includes(formType)) {
            $formTypeField.val("discount");
            $sponsorshipLevelField.val("");
            $("#discount-type").val(formType === "cdr" ? "buyer" : formType);
        } else {
            $formTypeField.val(formType);
            $sponsorshipLevelField.val("");
            $("#discount-type").val("");
        }
    }

    function updateActiveTabs(formType) {
        $tabs.removeClass("active");
        const $activeTab = $tabs.filter(function () {
            return $(this).data("form-open") === formType;
        });
        $activeTab.addClass("active");
    }

    $(document).on("click", "[data-form-open]", function (e) {
        e.preventDefault();
        const formType = $(this).data("form-open");
        updateFormVisibility(formType);
        if ($form.is(":hidden")) {
            $form.show().css("display", "flex");
            $formOverlay.show();
            setTimeout(() => {
                $form.addClass("open");
                $formOverlay.addClass("open");
            }, 10);
        }
    });

    $formOverlay.on("click", function () {
        $form.removeClass("open");
        $formOverlay.removeClass("open");
        setTimeout(() => {
            $form.hide();
            $formOverlay.hide();
        }, 300);
    });

    $("#close-unified-form").on("click", function () {
        $form.removeClass("open");
        $formOverlay.removeClass("open");
        setTimeout(() => {
            $form.hide();
            $formOverlay.hide();
        }, 300);
    });

    function hideConditionalFields() {
        $('[data-field-type="cdr-other"]').hide();
    }

    initializeChoices();
    hideConditionalFields();
    checkStartupFields();

    const cdrFocusElement = document.querySelector("#U-CDR-Focus");
    if (cdrFocusElement && cdrFocusElement.choices) {
        cdrFocusElement.addEventListener("change", checkOtherCdrFields);
        cdrFocusElement.addEventListener("addItem", checkOtherCdrFields);
        cdrFocusElement.addEventListener("removeItem", checkOtherCdrFields);
    }

    // Remove duplicate required attribute from input field
    $("select[multiple]").each(function () {
        $(this).removeAttr("required");
    });

    // Immediately update required status on input or change events
    $(
        ".unified-contact-form input, .unified-contact-form select, .unified-contact-form textarea"
    ).on("input change", function () {
        updateFieldRequiredStatus();
    });

    $("#U-submit").on("click", function (e) {
        console.log("clicked");
        let valid = true;
        const $orgType = $('#U-Organisation-Type');
        if ($orgType.length && $orgType.is(':visible') && $orgType.closest('.required').length > 0) {
            const values = $orgType[0].choices.getValue();
            console.log("values", values);
            if (values.length === 0) {
                valid = false;
                alert("Please select at least one option for Organisation Type");
            }
        }
        if (!valid) {
            e.preventDefault();
        }
    });
});
