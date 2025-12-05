import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Админ-панель для управления пользователями и энергией
    Args: event - содержит httpMethod, headers с X-Auth-Token, body с данными
          context - объект с request_id
    Returns: JSON с результатами операций или списком пользователей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Id',
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
    
    headers = event.get('headers', {})
    admin_id = headers.get('X-Admin-Id')
    
    if not admin_id:
        return {
            'statusCode': 403,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Требуется авторизация администратора'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute("SELECT is_admin FROM users WHERE id = %s", (int(admin_id),))
        admin_check = cur.fetchone()
        
        if not admin_check or not admin_check[0]:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Доступ запрещен'}),
                'isBase64Encoded': False
            }
        
        if method == 'GET':
            cur.execute(
                "SELECT id, email, name, energy, is_admin, created_at FROM users ORDER BY created_at DESC"
            )
            users = cur.fetchall()
            
            result = {
                'success': True,
                'users': [
                    {
                        'id': u[0],
                        'email': u[1],
                        'name': u[2],
                        'energy': u[3],
                        'is_admin': u[4],
                        'created_at': u[5].isoformat() if u[5] else None
                    }
                    for u in users
                ]
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
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            user_id = body_data.get('user_id')
            
            if action == 'update_energy':
                amount = body_data.get('amount', 0)
                reason = body_data.get('reason', 'Выдано администратором')
                
                cur.execute(
                    "UPDATE users SET energy = energy + %s WHERE id = %s RETURNING energy",
                    (amount, user_id)
                )
                new_energy = cur.fetchone()
                
                cur.execute(
                    "INSERT INTO energy_transactions (user_id, amount, reason, admin_id) VALUES (%s, %s, %s, %s)",
                    (user_id, amount, reason, int(admin_id))
                )
                
                conn.commit()
                
                result = {
                    'success': True,
                    'new_energy': new_energy[0] if new_energy else 0
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif action == 'set_energy':
                energy = body_data.get('energy', 0)
                
                cur.execute(
                    "UPDATE users SET energy = %s WHERE id = %s",
                    (energy, user_id)
                )
                conn.commit()
                
                result = {'success': True, 'new_energy': energy}
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(result),
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
            'body': json.dumps({'error': f'Ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }
