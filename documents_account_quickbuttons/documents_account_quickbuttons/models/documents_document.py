from odoo import models, fields
class DocumentsDocument(models.Model):
    _inherit = 'documents.document'
    doc_invoice_ref = fields.Char(string="Invoice Number")
    doc_invoice_date = fields.Date(string="Invoice Date")
    doc_payment_type = fields.Selection([
        ('check', 'Check'),
        ('credit', 'Credit/ACH'),
    ], string="Payment Type")
    doc_payment_due_date = fields.Date(string="Payment Due Date")
    def action_create_move_with_fields(self, move_type):
        self.ensure_one()
        result = self.account_create_account_move(move_type)
        if result and result.get('type') == 'ir.actions.act_window' and result.get('res_id'):
            move = self.env['account.move'].browse(result['res_id'])
            if move.state == 'draft':
                vals = {}
                if self.doc_invoice_ref:
                    vals['ref'] = self.doc_invoice_ref
                if self.doc_invoice_date:
                    vals['invoice_date'] = self.doc_invoice_date
                if self.doc_payment_due_date:
                    vals['invoice_date_due'] = self.doc_payment_due_date
                if vals:
                    move.write(vals)
        return result
    def action_register_document_payment(self):
        self.ensure_one()
        if self.res_model != 'account.move' or not self.res_id:
            return {'type': 'ir.actions.act_window_close'}
        move = self.env['account.move'].browse(self.res_id)
        return move.action_register_payment()
