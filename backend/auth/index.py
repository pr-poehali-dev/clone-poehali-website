import json
import os
import psycopg2
from typing import Dict, Any
import hashlib
import secrets

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обрабатывает регистрацию и авторизацию пользователей с системой энергии
    Args: event - содержит httpMethod, body с email, password, name (для регистрации)
          context - объект с request_id и другими атрибутами
    Returns: JSON с данными пользователя, токеном и балансом энергии
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'DATABASE_URL не настроен'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'login')
            email = body_data.get('email', '').strip().lower()
            password = body_data.get('password', '')
            
            if not email or not password:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email и пароль обязательны'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            if action == 'register':
                name = body_data.get('name', 'Пользователь')
                
                initial_energy = 100000 if email == 'den.nazarenko.02@internet.ru' else 100
                is_admin = email == 'den.nazarenko.02@internet.ru'
                
                cur.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (email,)
                )
                existing = cur.fetchone()
                
                if existing:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "INSERT INTO users (email, password_hash, name, energy, is_admin) VALUES (%s, %s, %s, %s, %s) RETURNING id, email, name, energy, is_admin",
                    (email, password_hash, name, initial_energy, is_admin)
                )
                user = cur.fetchone()
                conn.commit()
                
                token = secrets.token_urlsafe(32)
                
                result = {
                    'success': True,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'name': user[2],
                        'energy': user[3],
                        'is_admin': user[4]
                    },
                    'token': token
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                cur.execute(
                    "SELECT id, email, name, energy, is_admin, password_hash FROM users WHERE email = %s",
                    (email,)
                )
                user = cur.fetchone()
                
                if not user or user[5] != password_hash:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
                
                token = secrets.token_urlsafe(32)
                
                result = {
                    'success': True,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'name': user[2],
                        'energy': user[3],
                        'is_admin': user[4]
                    },
                    'token': token
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            auth_header = event.get('headers', {}).get('X-Auth-Token', '')
            if not auth_header:
                cur.close()
                conn.close()
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Не авторизован'}),
                    'isBase64Encoded': False
                }
            
            user_id = event.get('queryStringParameters', {}).get('user_id')
            if user_id:
                cur.execute(
                    "SELECT id, email, name, energy, is_admin FROM users WHERE id = %s",
                    (int(user_id),)
                )
                user = cur.fetchone()
                
                if user:
                    result = {
                        'success': True,
                        'user': {
                            'id': user[0],
                            'email': user[1],
                            'name': user[2],
                            'energy': user[3],
                            'is_admin': user[4]
                        }
                    }
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(result, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Неверный запрос'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
