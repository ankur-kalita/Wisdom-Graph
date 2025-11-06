import requests
import sys
import json
from datetime import datetime

class LearningMapAPITester:
    def __init__(self, base_url="http://127.0.0.1:8001/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True, "Non-JSON response")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Status {response.status_code}: {error_data}")
                except:
                    self.log_test(name, False, f"Status {response.status_code}: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - backend may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200, auth_required=False)

    def test_register(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        test_data = {
            "name": "Test User",
            "email": test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "auth/register", 
            200, 
            test_data, 
            auth_required=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   ✓ Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_login(self):
        """Test user login with existing user"""
        # First register a user for login test
        test_email = f"login_test_{datetime.now().strftime('%H%M%S')}@example.com"
        register_data = {
            "name": "Login Test User",
            "email": test_email,
            "password": "LoginTest123!"
        }
        
        # Register user
        success, _ = self.run_test(
            "Pre-Login Registration", 
            "POST", 
            "auth/register", 
            200, 
            register_data, 
            auth_required=False
        )
        
        if not success:
            return False
        
        # Now test login
        login_data = {
            "email": test_email,
            "password": "LoginTest123!"
        }
        
        success, response = self.run_test(
            "User Login", 
            "POST", 
            "auth/login", 
            200, 
            login_data, 
            auth_required=False
        )
        
        return success and 'access_token' in response

    def test_get_me(self):
        """Test get current user endpoint"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_generate_map(self):
        """Test learning map generation"""
        map_data = {
            "topic": "Python Programming",
            "level": "Beginner"
        }
        
        success, response = self.run_test(
            "Generate Learning Map", 
            "POST", 
            "generate-map", 
            200, 
            map_data
        )
        
        if success and response.get('success') and 'data' in response:
            map_data = response['data']
            if 'nodes' in map_data and 'edges' in map_data:
                print(f"   ✓ Generated {len(map_data['nodes'])} nodes and {len(map_data['edges'])} edges")
                return True
        return False

    def test_expand_node(self):
        """Test node expansion"""
        expand_data = {
            "node_label": "Python Basics",
            "topic": "Python Programming",
            "level": "Beginner"
        }
        
        success, response = self.run_test(
            "Expand Node", 
            "POST", 
            "expand-node", 
            200, 
            expand_data
        )
        
        if success and response.get('success') and 'subtopics' in response:
            subtopics = response['subtopics']
            print(f"   ✓ Generated {len(subtopics)} subtopics")
            return True
        return False

    def test_save_map(self):
        """Test saving a learning map"""
        save_data = {
            "topic": "Test Topic",
            "level": "Beginner",
            "nodes": [
                {
                    "id": "node1",
                    "type": "custom",
                    "data": {"label": "Test Node", "description": "Test Description"},
                    "position": {"x": 0, "y": 0}
                }
            ],
            "edges": []
        }
        
        success, response = self.run_test(
            "Save Learning Map", 
            "POST", 
            "maps/save", 
            200, 
            save_data
        )
        
        if success and response.get('success') and 'map_id' in response:
            self.saved_map_id = response['map_id']
            print(f"   ✓ Map saved with ID: {self.saved_map_id}")
            return True
        return False

    def test_get_maps(self):
        """Test getting all saved maps"""
        success, response = self.run_test("Get Saved Maps", "GET", "maps", 200)
        
        if success and response.get('success') and 'maps' in response:
            maps = response['maps']
            print(f"   ✓ Retrieved {len(maps)} saved maps")
            return True
        return False

    def test_get_specific_map(self):
        """Test getting a specific map"""
        if not hasattr(self, 'saved_map_id'):
            print("   ⚠️  Skipping - no saved map ID available")
            return True
        
        success, response = self.run_test(
            "Get Specific Map", 
            "GET", 
            f"maps/{self.saved_map_id}", 
            200
        )
        
        if success and response.get('success') and 'map' in response:
            map_data = response['map']
            print(f"   ✓ Retrieved map: {map_data.get('topic', 'Unknown')}")
            return True
        return False

    def test_export_map(self):
        """Test exporting a map"""
        if not hasattr(self, 'saved_map_id'):
            print("   ⚠️  Skipping - no saved map ID available")
            return True
        
        success, response = self.run_test(
            "Export Map", 
            "GET", 
            f"maps/{self.saved_map_id}/export", 
            200
        )
        
        if success and 'topic' in response:
            print(f"   ✓ Exported map data")
            return True
        return False

    def test_delete_map(self):
        """Test deleting a map"""
        if not hasattr(self, 'saved_map_id'):
            print("   ⚠️  Skipping - no saved map ID available")
            return True
        
        success, response = self.run_test(
            "Delete Map", 
            "DELETE", 
            f"maps/{self.saved_map_id}", 
            200
        )
        
        return success and response.get('success')

def main():
    print("🚀 Starting AI Learning Map API Tests")
    print("=" * 50)
    
    tester = LearningMapAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("User Registration", tester.test_register),
        ("User Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        ("Generate Learning Map", tester.test_generate_map),
        ("Expand Node", tester.test_expand_node),
        ("Save Learning Map", tester.test_save_map),
        ("Get Saved Maps", tester.test_get_maps),
        ("Get Specific Map", tester.test_get_specific_map),
        ("Export Map", tester.test_export_map),
        ("Delete Map", tester.test_delete_map),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Exception: {str(e)}")
        print()  # Add spacing between tests
    
    # Print final results
    print("=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Print failed tests
    failed_tests = [r for r in tester.test_results if not r['success']]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   • {test['test']}: {test['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())