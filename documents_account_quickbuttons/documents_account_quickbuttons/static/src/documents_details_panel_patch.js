/** @odoo-module **/
import { DocumentsDetailsPanel } from "@documents/components/documents_details_panel/documents_details_panel";
import { patch } from "@web/core/utils/patch";
import { useState } from "@odoo/owl";
patch(DocumentsDetailsPanel.prototype, {
    setup() {
        super.setup(...arguments);
        this.quickFields = useState({
            doc_invoice_ref: "",
            doc_invoice_date: "",
            doc_payment_type: "",
            doc_payment_due_date: "",
            _loadedId: null,
        });
    },
    get currentDocId() {
        return this.record?.resId || null;
    },
    get showQuickButtons() {
        const d = this.record?.data;
        return d && d.type !== "folder";
    },
    get isLinkedToMove() {
        const d = this.record?.data;
        if (!d) return false;
        const resId = d.res_id;
        const linked = resId && (typeof resId === "object" ? resId.resId : resId);
        return d.res_model === "account.move" && linked;
    },
    async ensureFieldsLoaded() {
        const id = this.currentDocId;
        if (!id || id === this.quickFields._loadedId) return;
        this.quickFields._loadedId = id;
        try {
            const results = await this.orm.read(
                "documents.document",
                [id],
                ["doc_invoice_ref", "doc_invoice_date", "doc_payment_type", "doc_payment_due_date"]
            );
            if (results && results.length) {
                const data = results[0];
                this.quickFields.doc_invoice_ref = data.doc_invoice_ref || "";
                this.quickFields.doc_invoice_date = data.doc_invoice_date || "";
                this.quickFields.doc_payment_type = data.doc_payment_type || "";
                this.quickFields.doc_payment_due_date = data.doc_payment_due_date || "";
            }
        } catch (e) {
            console.warn("quickbuttons: load error", e);
        }
    },
    async saveQuickField(field, ev) {
        const val = ev.target.value || false;
        const id = this.currentDocId;
        if (!id) return;
        try {
            await this.orm.write("documents.document", [id], { [field]: val });
            this.quickFields[field] = ev.target.value || "";
        } catch (e) {
            console.warn("quickbuttons: save error", e);
        }
    },
    async onCreateVendorBill() {
        const id = this.currentDocId;
        if (!id) return;
        const result = await this.orm.call(
            "documents.document",
            "action_create_move_with_fields",
            [[id], "in_invoice"]
        );
        if (result) {
            await this.action.doAction(result);
        }
    },
    async onCreateCustomerInvoice() {
        const id = this.currentDocId;
        if (!id) return;
        const result = await this.orm.call(
            "documents.document",
            "action_create_move_with_fields",
            [[id], "out_invoice"]
        );
        if (result) {
            await this.action.doAction(result);
        }
    },
    async onRegisterPayment() {
        const id = this.currentDocId;
        if (!id) return;
        const result = await this.orm.call(
            "documents.document",
            "action_register_document_payment",
            [[id]]
        );
        if (result) {
            await this.action.doAction(result);
        }
    },
});
