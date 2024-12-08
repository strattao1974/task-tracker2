<?php
/*
Plugin Name: Task Tracker
Description: React-based task tracking application
Version: 1.0
*/

// Create tasks table on plugin activation
function task_tracker_activate() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'task_tracker_tasks';
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id varchar(36) NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        completed boolean DEFAULT 0,
        priority varchar(10) NOT NULL,
        due_date datetime,
        project_id varchar(36),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'task_tracker_activate');

// Register REST API endpoints
function task_tracker_register_routes() {
    register_rest_route('task-tracker/v1', '/tasks', array(
        'methods' => 'GET',
        'callback' => 'tt_get_tasks',
        'permission_callback' => 'tt_check_permissions'
    ));
    
    register_rest_route('task-tracker/v1', '/tasks', array(
        'methods' => 'POST',
        'callback' => 'tt_create_task',
        'permission_callback' => 'tt_check_permissions'
    ));
    
    register_rest_route('task-tracker/v1', '/tasks/(?P<id>[\\w-]+)', array(
        'methods' => 'PUT',
        'callback' => 'tt_update_task',
        'permission_callback' => 'tt_check_permissions'
    ));
    
    register_rest_route('task-tracker/v1', '/tasks/(?P<id>[\\w-]+)', array(
        'methods' => 'DELETE',
        'callback' => 'tt_delete_task',
        'permission_callback' => 'tt_check_permissions'
    ));
}
add_action('rest_api_init', 'task_tracker_register_routes');

// Permissions check
function tt_check_permissions() {
    return current_user_can('edit_posts') || !is_user_logged_in();
}

// API Endpoints
function tt_get_tasks() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'task_tracker_tasks';

    $tasks = $wpdb->get_results(
        "SELECT * FROM {$table_name} ORDER BY created_at DESC"
    );
    
    // Convert MySQL boolean to PHP boolean
    $formatted_tasks = array();
    foreach ($tasks as $task) {
        $formatted_tasks[] = array(
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'completed' => (bool)$task->completed,
            'priority' => $task->priority,
            'due_date' => $task->due_date,
            'project_id' => $task->project_id,
            'created_at' => $task->created_at
        );
    }
    
    header('Content-Type: application/json');
    return new WP_REST_Response($formatted_tasks, 200);
}

function tt_create_task($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'task_tracker_tasks';
    
    $body = json_decode($request->get_body(), true);
    
    if (!isset($body['title']) || empty($body['title'])) {
        return new WP_Error('invalid_task', 'Title is required', array('status' => 400));
    }
    
    $task = array(
        'id' => $body['id'],
        'title' => sanitize_text_field($body['title']),
        'description' => sanitize_textarea_field($body['description'] ?? ''),
        'completed' => $body['completed'] ? 1 : 0,
        'priority' => sanitize_text_field($body['priority']),
        'due_date' => isset($body['due_date']) ? sanitize_text_field($body['due_date']) : null,
        'project_id' => isset($body['project_id']) ? sanitize_text_field($body['project_id']) : null,
        'created_at' => sanitize_text_field($body['created_at'])
    );
    
    $wpdb->insert($table_name, $task);
    
    // Format response to match client expectations
    $response = array(
        'id' => $task['id'],
        'title' => $task['title'],
        'description' => $task['description'],
        'completed' => (bool)$task['completed'],
        'priority' => $task['priority'],
        'due_date' => $task['due_date'],
        'project_id' => $task['project_id'],
        'created_at' => $task['created_at']
    );
    
    return new WP_REST_Response($response, 201);
}

function tt_update_task($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'task_tracker_tasks';
    
    $id = $request['id'];
    $body = json_decode($request->get_body(), true);
    
    // Check if task exists
    $exists = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE id = %s",
        $id
    ));
    
    if (!$exists) {
        return new WP_Error('task_not_found', 'Task not found', array('status' => 404));
    }
    
    $task = array(
        'title' => sanitize_text_field($body['title'] ?? ''),
        'description' => sanitize_textarea_field($body['description'] ?? ''),
        'completed' => isset($body['completed']) ? (bool)$body['completed'] : null,
        'priority' => sanitize_text_field($body['priority'] ?? ''),
        'due_date' => $body['due_date'] ?? null,
        'project_id' => $body['project_id'] ?? null
    );
    
    // Remove null values
    $task = array_filter($task, function($value) {
        return $value !== null;
    });
    
    $wpdb->update($table_name, $task, array('id' => $id));
    
    // Get the updated task
    $updated_task = $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $id)
    );
    
    if (!$updated_task) {
        return new WP_REST_Response(array('message' => 'Task not found'), 404);
    }
    
    // Format response
    $response = array(
        'id' => $updated_task->id,
        'title' => $updated_task->title,
        'description' => $updated_task->description,
        'completed' => (bool)$updated_task->completed,
        'priority' => $updated_task->priority,
        'due_date' => $updated_task->due_date,
        'project_id' => $updated_task->project_id,
        'created_at' => $updated_task->created_at
    );
    
    return new WP_REST_Response($response, 200);
}

function tt_delete_task($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'task_tracker_tasks';
    
    $id = $request['id'];
    
    // Check if task exists
    $exists = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE id = %s",
        $id
    ));
    
    if (!$exists) {
        return new WP_Error('task_not_found', 'Task not found', array('status' => 404));
    }
    
    $wpdb->delete($table_name, array('id' => $id));
    
    return new WP_REST_Response(null, 204);
}

// Shortcode
function task_tracker_shortcode() {
    $plugin_url = plugin_dir_url(__FILE__);
    $plugin_path = plugin_dir_path(__FILE__);
    
    // Get the first matching CSS and JS files
    $css_files = glob($plugin_path . 'dist/assets/index.*.css');
    $js_files = glob($plugin_path . 'dist/assets/index.*.js');
    
    if (empty($css_files) || empty($js_files)) {
        return '<div class="error">Task Tracker assets not found. Please rebuild the plugin.</div>';
    }
    
    $css_file = basename($css_files[0]);
    $js_file = basename($js_files[0]);
    
    // Add REST API URL to window object
    $config_data = array(
            'apiUrl' => esc_url_raw(get_rest_url(null, 'task-tracker/v1')),
            'nonce' => wp_create_nonce('wp_rest')
    );
    
    // Enqueue styles
    wp_register_style(
        'task-tracker-styles', 
        $plugin_url . 'dist/assets/' . $css_file,
        array(),
        '1.0'
    );
    wp_enqueue_style('task-tracker-styles');
    
    // Enqueue scripts
    wp_register_script(
        'task-tracker-js',
        $plugin_url . 'dist/assets/' . $js_file,
        array(),
        '1.0',
        true
    );
    wp_localize_script('task-tracker-js', 'taskTrackerConfig', $config_data);
    wp_enqueue_script('task-tracker-js');
    
    return '<div id="root" class="task-tracker-root"></div>';
}
add_shortcode('task_tracker', 'task_tracker_shortcode');