import  * as bootstrap from 'bootstrap';

export function showErrorModal(message: string, title = 'An error occurred') {
    const modalElement = document.getElementById('statusErrorsModal');
    if (!modalElement || modalElement.classList.contains('show')) {
        console.debug('Error modal already shown');
        return;
    }
    const errorModal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);

    document.getElementById('errorModalDescription')!.innerText = message;
    document.getElementById('errorModalTitleError')!.innerText = title;

    errorModal.show();
}

export function showSuccessModal(message: string) {
    const modalElement = document.getElementById('statusSuccessModal');
    if (!modalElement || modalElement.classList.contains('show')) {
        return;
    }
    document.getElementById('successModalTxt')!.innerText = message;
    const successModal = new bootstrap.Modal(modalElement);

    successModal.show();
}

/**
 * Creates a confirmation modal with customizable options.
 * 
 * @param { Object } options - The options for the confirmation modal.
 * @param { string } options.text - The text to display in the modal.
 * @param { string } [options.tittle] - The title of the modal. Defaults to '¿Está seguro de realizar esta acción?'.
 * @param { string } [options.confirmButtonText] - The text to display on the confirm button. Defaults to 'Sí, estoy seguro'.
 * @param { string } [options.confirmButtonColor] - The color of the confirm button. Defaults to 'primary'.
 * @param { string } [options.cancelButtonText] - The text to display on the cancel button. Defaults to 'Cancelar'.
 * @param { string } [options.cancelButtonColor] - The color of the cancel button. Defaults to 'secondary'.
 * @param { Function } options.afterConfirm - The function to execute after the confirm button is clicked.
 */
export function createQuestion(options: any) {
    if (!options.text) {
        console.error('Text is required');
        return;
    }
    if (!options.afterConfirm) {
        console.error('After confirm function is required');
        return;
    }
    document.getElementById('confirmModalText')!.textContent = options.text;
    document.getElementById('confirmModalTittle')!.textContent = options.tittle || '¿Está seguro de realizar esta acción?';

    const confirmButton = document.getElementById('confirmModalButton')!;
    confirmButton.textContent = options.confirmButtonText || 'Sí, estoy seguro';
    confirmButton.classList.add('btn-' + (options.confirmButtonColor || 'primary'));

    const cancelButton = document.getElementById('cancelModalButton')!;
    cancelButton.textContent = options.cancelButtonText || 'Cancelar';
    cancelButton.classList.add('btn-' + (options.cancelButtonColor || 'secondary'));

    const confirmFn = function() {
        options.afterConfirm();

        var confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal')!)!;
        confirmModal.hide();
    }
    confirmButton.addEventListener('click', confirmFn, true);

    const element = document.getElementById('confirmModal')!;
    const confirmModal = new bootstrap.Modal(element);
    confirmModal.show();

    element.addEventListener('hidden.bs.modal', function () {
		confirmButton.removeEventListener('click', confirmFn, true);
    });
}
