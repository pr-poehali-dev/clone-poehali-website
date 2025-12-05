import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерирует структуру и контент сайта на основе текстового описания пользователя
    Args: event - содержит httpMethod, body с description проекта
          context - объект с request_id, function_name и другими атрибутами
    Returns: JSON с HTML, CSS, JS кодом сгенерированного сайта
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        description: str = body_data.get('description', '')
        
        if not description:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Описание проекта обязательно'}),
                'isBase64Encoded': False
            }
        
        openai_key = os.environ.get('OPENAI_API_KEY')
        if not openai_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'OpenAI API ключ не настроен'}),
                'isBase64Encoded': False
            }
        
        import openai
        openai.api_key = openai_key
        
        prompt = f"""Создай структуру современного одностраничного сайта на основе описания: "{description}"

Верни JSON со следующей структурой:
{{
  "title": "Название сайта",
  "description": "Краткое описание",
  "hero": {{
    "title": "Заголовок героя",
    "subtitle": "Подзаголовок",
    "cta": "Текст кнопки"
  }},
  "features": [
    {{"icon": "Rocket", "title": "Название", "description": "Описание"}}
  ],
  "about": {{
    "title": "О нас",
    "content": "Текст"
  }},
  "contact": {{
    "email": "email@example.com",
    "phone": "+7 (999) 123-45-67"
  }}
}}

Используй иконки из lucide-react. Создай профессиональный контент на русском языке."""

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Ты эксперт по созданию сайтов. Возвращай только валидный JSON без markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        result_text = response.choices[0].message.content.strip()
        
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        website_data = json.loads(result_text)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'data': website_data,
                'request_id': context.request_id
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Некорректный JSON в запросе'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка генерации: {str(e)}'}),
            'isBase64Encoded': False
        }
