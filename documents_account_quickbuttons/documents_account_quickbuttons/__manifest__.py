{
    'name': 'Documents - Quick Accounting Buttons',
    'version': '18.0.3.0.0',
    'category': 'Productivity/Documents',
    'summary': 'Adds accounting buttons and extra fields in the Documents panel',
    'depends': ['documents_account'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'documents_account_quickbuttons/static/src/**/*',
        ],
    },
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
