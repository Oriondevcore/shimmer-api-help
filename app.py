from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# In-memory storage for demonstration
# In production, you'd connect to D1 or another database
open_kj_data = []

@app.route('/')
def index():
    return render_template('index.html')

# API endpoint for Cloudflare D1 to receive requests
@app.route('/api/open-kj/receive', methods=['POST'])
def receive_data():
    """
    Receive data from Cloudflare D1 database.
    Expects JSON payload with data to process.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Process the incoming data
        processed = {
            'id': data.get('id'),
            'type': data.get('type', 'unknown'),
            'payload': data.get('payload'),
            'timestamp': data.get('timestamp'),
            'source': 'cloudflare-d1'
        }
        
        open_kj_data.append(processed)
        
        return jsonify({
            'status': 'success',
            'message': 'Data received successfully',
            'data': processed
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API endpoint for PWA to fetch data
@app.route('/api/open-kj/data', methods=['GET'])
def get_data():
    """
    Return all stored Open KJ data for the PWA to consume.
    """
    return jsonify({
        'status': 'success',
        'count': len(open_kj_data),
        'data': open_kj_data
    }), 200

# API endpoint for PWA to fetch specific item
@app.route('/api/open-kj/data/<item_id>', methods=['GET'])
def get_item(item_id):
    """
    Return a specific item by ID.
    """
    for item in open_kj_data:
        if item.get('id') == item_id:
            return jsonify({'status': 'success', 'data': item}), 200
    
    return jsonify({'error': 'Item not found'}), 404

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
