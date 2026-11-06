#!/usr/bin/env python3
"""
Genera la configuración del panel (public/admin/config.yml) a partir de los archivos de /content.
Si agregás textos nuevos en content/textos/es.json, corré:  python3 scripts/generar-panel.py
"""
import json
import pathlib
import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = 'franaltt/piero-web'

SECTION_LABELS = {
    'intro': 'Intro (el chat del principio)', 'nav': 'Menú', 'hero': 'Inicio', 'statement': 'Frase de los logos',
    'work': 'El trabajo', 'savia': 'Caso Savia', 'game': 'Juego ¿Cuál es la foto real?', 'how': 'Cómo funciona',
    'about': 'Soy Piero', 'pricing': 'Precios (textos)', 'faq': 'Preguntas frecuentes', 'sample': 'Muestra gratis',
    'footer': 'Footer', 'offer': 'Oferta (etiquetas)', 'recursos': 'Recursos (textos)',
}
KEY_LABELS = {
    'title': 'Título', 'lead': 'Bajada', 'text': 'Texto', 'cta': 'Botón', 'ctaAlt': 'Botón secundario', 'body': 'Texto',
    'items': 'Elementos', 'q': 'Pregunta', 'a': 'Respuesta', 'steps': 'Pasos', 't': 'Título', 'd': 'Descripción',
    'when': 'Cuándo', 'stats': 'Números', 'labels': 'Etiquetas', 'opts': 'Opciones', 'k': 'Clave (no cambiar)',
    'notes': 'Notas', 'filters': 'Filtros', 'types': 'Tipos', 'rubros': 'Rubros', 'names': 'Nombres', 'week': 'Días',
    'points': 'Puntos', 'phone': 'Pantallas del teléfono', 'ticket': 'Ticket del piloto', 'rows': 'Filas', 'v': 'Valor',
}
LANG_LABEL = {'es': 'Textos en español', 'it': 'Textos en italiano', 'en': 'Textos en inglés'}


def label(key):
    return KEY_LABELS.get(key, key.replace('_', ' ').capitalize())


def field_for(key, value, lab=None):
    """Arma el campo del panel según el tipo de dato."""
    lab = lab or label(key)
    if isinstance(value, bool):
        return {'name': key, 'label': lab, 'widget': 'boolean', 'required': False}
    if isinstance(value, (int, float)):
        return {'name': key, 'label': lab, 'widget': 'number', 'value_type': 'int' if isinstance(value, int) else 'float'}
    if isinstance(value, str):
        return {'name': key, 'label': lab, 'widget': 'text' if len(value) > 70 else 'string', 'required': False}
    if isinstance(value, dict):
        return {'name': key, 'label': lab, 'widget': 'object', 'collapsed': True,
                'fields': [field_for(k, v) for k, v in value.items()]}
    if isinstance(value, list):
        first = value[0] if value else ''
        if isinstance(first, dict):
            return {'name': key, 'label': lab, 'widget': 'list', 'collapsed': True,
                    'summary': '{{fields.%s}}' % next(iter(first)),
                    'fields': [field_for(k, v) for k, v in first.items()]}
        if isinstance(first, list):  # filas de pares [clave, valor]
            return {'name': key, 'label': lab, 'widget': 'list', 'collapsed': True,
                    'field': {'name': 'fila', 'label': 'Fila', 'widget': 'list'}}
        return {'name': key, 'label': lab, 'widget': 'list', 'field': {'name': 'item', 'label': 'Texto', 'widget': 'string'}}
    return {'name': key, 'label': lab, 'widget': 'string'}


def langs_object(name, lab, multiline=False):
    w = 'text' if multiline else 'string'
    return {'name': name, 'label': lab, 'widget': 'object', 'fields': [
        {'name': 'es', 'label': 'Español', 'widget': w}, {'name': 'it', 'label': 'Italiano', 'widget': w, 'required': False},
        {'name': 'en', 'label': 'Inglés', 'widget': w, 'required': False}]}


es = json.loads((ROOT / 'content/textos/es.json').read_text())
rubros = list(es['work']['rubros'].keys())
plan_ids = [p['id'] for p in json.loads((ROOT / 'content/precios.json').read_text())['plans']]

text_fields = [field_for(k, v, SECTION_LABELS.get(k)) for k, v in es.items()]
HINTS = {
    'statement': 'Los {0} {1} {2}… son los huecos donde bajan los logos. No los borres: movelos si cambiás la frase.',
    'about': 'En "Números" van solo las etiquetas; los números se cambian en Números y contacto.',
    'pricing': 'Los precios se cambian en Precios y ofertas. Acá van solo los textos. {h} = horas, {price} = precio.',
    'faq': '{price} se reemplaza solo por el precio del piloto.',
}
for f in text_fields:
    if f['name'] in HINTS:
        f['hint'] = HINTS[f['name']]

config = {
    'backend': {'name': 'github', 'repo': REPO, 'branch': 'main', 'commit_messages': {'update': 'Panel: actualiza {{slug}}'}},
    'local_backend': True,  # para probar en la compu con "npx decap-server"
    'locale': 'es',
    'logo_url': '/admin/logo.svg',
    'media_folder': 'public/uploads',
    'public_folder': '/uploads',
    'collections': [
        {'name': 'ventas', 'label': 'Precios y ofertas', 'editor': {'preview': False}, 'files': [
            {'name': 'oferta', 'label': 'Oferta', 'file': 'content/oferta.json', 'format': 'json', 'fields': [
                {'name': 'active', 'label': 'Oferta prendida', 'widget': 'boolean', 'hint': 'Prendela para que aparezca en la web. Se apaga sola cuando pasa la fecha.'},
                {'name': 'until', 'label': 'Válida hasta (inclusive)', 'widget': 'datetime', 'format': 'YYYY-MM-DD', 'date_format': 'DD/MM/YYYY', 'time_format': False},
                {'name': 'applies_to', 'label': 'Se aplica a', 'widget': 'select', 'options': [{'label': 'El piloto', 'value': 'pilot'}] + [{'label': 'Plan ' + p, 'value': p} for p in plan_ids]},
                {'name': 'price', 'label': 'Precio de oferta (USD)', 'widget': 'number', 'value_type': 'int'},
                langs_object('title', 'Título'),
                langs_object('text', 'Texto ({price} = precio de oferta, {regular} = precio normal, {until} = fecha)', True),
                langs_object('cta', 'Texto del botón'),
            ]},
            {'name': 'precios', 'label': 'Precios', 'file': 'content/precios.json', 'format': 'json', 'fields': [
                {'name': 'pilot', 'label': 'El piloto', 'widget': 'object', 'fields': [
                    {'name': 'price', 'label': 'Precio (USD)', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'pieces', 'label': 'Piezas', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'weeks', 'label': 'Semanas', 'widget': 'number', 'value_type': 'int'}]},
                {'name': 'plans', 'label': 'Planes mensuales', 'widget': 'list', 'summary': '{{fields.id}} · USD {{fields.price}}', 'fields': [
                    {'name': 'id', 'label': 'Código del plan (no cambiar)', 'widget': 'string', 'hint': 'base, estandar o completo. El nombre visible se cambia en Textos → Precios.'},
                    {'name': 'perWeek', 'label': 'Piezas por semana', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'price', 'label': 'Precio por mes (USD)', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'channels', 'label': 'Redes incluidas', 'widget': 'select', 'multiple': True, 'options': [
                        {'label': 'Instagram', 'value': 'instagram'}, {'label': 'Facebook', 'value': 'facebook'}, {'label': 'TikTok', 'value': 'tiktok'},
                        {'label': 'YouTube Shorts', 'value': 'youtube'}, {'label': 'LinkedIn', 'value': 'linkedin'}]},
                    {'name': 'changes', 'label': 'Cambios en hasta (horas)', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'publish', 'label': 'Publicación incluida', 'widget': 'boolean', 'required': False},
                    {'name': 'recommended', 'label': 'Es el que recomiendo', 'widget': 'boolean', 'required': False},
                    {'name': 'priority', 'label': 'Cambios con prioridad', 'widget': 'boolean', 'required': False}]},
            ]},
        ]},
        {'name': 'datos', 'label': 'Números, contacto y trabajos', 'editor': {'preview': False}, 'files': [
            {'name': 'numeros', 'label': 'Números y contacto', 'file': 'content/numeros.json', 'format': 'json', 'fields': [
                {'name': 'clients', 'label': 'Clientes (+)', 'widget': 'number', 'value_type': 'int'},
                {'name': 'pieces', 'label': 'Piezas hechas (+)', 'widget': 'number', 'value_type': 'int'},
                {'name': 'years', 'label': 'Años creando contenido', 'widget': 'number', 'value_type': 'int'},
                {'name': 'clients_brands', 'label': 'Marcas de la cinta', 'widget': 'list', 'field': {'name': 'marca', 'label': 'Marca', 'widget': 'string'}},
                {'name': 'socials', 'label': 'Redes', 'widget': 'list', 'summary': '{{fields.name}}', 'fields': [
                    {'name': 'name', 'label': 'Red', 'widget': 'string'}, {'name': 'handle', 'label': 'Usuario', 'widget': 'string'},
                    {'name': 'url', 'label': 'Link', 'widget': 'string'}]},
                {'name': 'whatsapp', 'label': 'WhatsApp', 'widget': 'object', 'fields': [
                    {'name': 'number', 'label': 'Número (solo dígitos, con código de país)', 'widget': 'string'},
                    {'name': 'display', 'label': 'Cómo se muestra', 'widget': 'string'}]},
            ]},
            {'name': 'trabajos', 'label': 'Trabajos del carrusel', 'file': 'content/trabajos.json', 'format': 'json', 'fields': [
                {'name': 'items', 'label': 'Piezas', 'widget': 'list', 'summary': '{{fields.brand}} · {{fields.type}}', 'fields': [
                    {'name': 'type', 'label': 'Tipo', 'widget': 'select', 'options': [
                        {'label': 'Anuncio (imagen)', 'value': 'anuncio'}, {'label': 'Video', 'value': 'video'}, {'label': 'Video casero (con sonido)', 'value': 'casero'}]},
                    {'name': 'brand', 'label': 'Marca', 'widget': 'string'},
                    {'name': 'rubro', 'label': 'Rubro', 'widget': 'select', 'options': rubros},
                    {'name': 'src', 'label': 'Archivo (imagen o video .mp4)', 'widget': 'file'},
                    {'name': 'poster', 'label': 'Portada del video (opcional)', 'widget': 'image', 'required': False},
                    {'name': 'secs', 'label': 'Duración en segundos (videos caseros)', 'widget': 'number', 'value_type': 'int', 'required': False}]},
            ]},
        ]},
        {'name': 'recursos', 'label': 'Recursos gratis', 'editor': {'preview': False}, 'files': [
            {'name': 'recursos', 'label': 'Guías, skill y Mailchimp', 'file': 'content/recursos.json', 'format': 'json', 'fields': [
                {'name': 'mailchimp', 'label': 'Mailchimp', 'widget': 'object', 'fields': [
                    {'name': 'url', 'label': 'Dirección del formulario', 'widget': 'string', 'required': False,
                     'hint': 'En Mailchimp: Audience → Signup forms → Embedded forms. Copiá lo que va en action="…" (termina en /subscribe/post?u=…&id=…).'},
                    {'name': 'guide_field', 'label': 'Campo para saber qué guía pidió (opcional)', 'widget': 'string', 'required': False,
                     'hint': 'Si creás un campo en tu audiencia (por ejemplo GUIA), escribí su etiqueta acá.'}]},
                {'name': 'skill', 'label': 'Skill destacada', 'widget': 'object', 'fields': [
                    {'name': 'active', 'label': 'Mostrar', 'widget': 'boolean'},
                    {'name': 'name', 'label': 'Nombre', 'widget': 'string'},
                    {'name': 'price', 'label': 'Precio (USD)', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'buy_url', 'label': 'Link de compra', 'widget': 'string', 'required': False, 'hint': 'Si lo dejás vacío, el botón abre WhatsApp.'},
                    {'name': 'video', 'label': 'Video', 'widget': 'file'},
                    langs_object('desc', 'Descripción', True),
                    {'name': 'bullets', 'label': 'Puntos', 'widget': 'object', 'fields': [
                        {'name': l, 'label': n, 'widget': 'list', 'field': {'name': 'punto', 'label': 'Punto', 'widget': 'string'}}
                        for l, n in (('es', 'Español'), ('it', 'Italiano'), ('en', 'Inglés'))]}]},
                {'name': 'guides', 'label': 'Guías', 'widget': 'list', 'summary': '{{fields.slug}}', 'fields': [
                    {'name': 'slug', 'label': 'Código (sin espacios)', 'widget': 'string'},
                    {'name': 'kind', 'label': 'Tipo', 'widget': 'select', 'options': [{'label': 'Guía', 'value': 'guia'}, {'label': 'Prompt', 'value': 'prompt'}]},
                    {'name': 'pages', 'label': 'Páginas', 'widget': 'number', 'value_type': 'int'},
                    {'name': 'cover', 'label': 'Portada', 'widget': 'image', 'required': False},
                    {'name': 'mailchimp_tag', 'label': 'ID de etiqueta de Mailchimp (opcional)', 'widget': 'string', 'required': False,
                     'hint': 'Con una etiqueta por guía, en Mailchimp armás un envío automático que manda el PDF correcto.'},
                    langs_object('title', 'Título'), langs_object('desc', 'Descripción', True)]},
            ]},
        ]},
        {'name': 'textos', 'label': 'Textos de la web', 'editor': {'preview': False}, 'files': [
            {'name': l, 'label': LANG_LABEL[l], 'file': f'content/textos/{l}.json', 'format': 'json', 'fields': text_fields}
            for l in ('es', 'it', 'en')
        ]},
    ],
}

out = ROOT / 'public/admin/config.yml'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text('# Generado por scripts/generar-panel.py — no editar a mano\n' + yaml.safe_dump(config, allow_unicode=True, sort_keys=False, width=200))
print('Panel generado:', out)
