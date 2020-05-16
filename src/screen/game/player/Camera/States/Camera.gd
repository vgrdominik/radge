extends CameraState
# Parent state for all camera based states for the Camera. Handles input based on
# the mouse or the gamepad. The camera's movement depends on the active child state.
# Holds shared logic between all states that move or rotate the camera.

const ZOOM_STEP: = 0.1
const ZOOM_MAX: = 1.0
const ZOOM_MIN: = 0.0

const ANGLE_X_MIN: = (-PI/4 + 0.3)
const ANGLE_X_MAX: = (PI/3 - 0.3)

export var is_y_inverted: = false
export var is_x_inverted: = false
export var fov_default: = 70.0
export var deadzone := PI/10
export var sensitivity_gamepad: = Vector2(2.5, 2.5)
export var sensitivity_mouse: = Vector2(0.5, 0.2)
export(float, 0.1, 1.0, 0.3) var sensitivity_autorotate: = 0.5

var camera_rotation_last: = Vector2.ZERO
var _input_relative: = Vector2.ZERO
var _is_aiming: = false
var zoom_enabled: = false

# index 0 -> left
# index 1 -> right
# index 2 -> up
# index 3 -> down
var collisied_position: Array = [0, 0, 0, 0]


func process(delta: float) -> void:
	camera_rig.global_transform.origin = camera_rig.player.global_transform.origin + camera_rig._position_start

	var look_direction: = get_look_direction()
	var move_direction: = get_move_direction()

	if (! collisied_position || (! collisied_position[0] && ! collisied_position[1] && ! collisied_position[2] && ! collisied_position[3])):		
		if _input_relative.length() > 0 && Input.is_action_pressed("right_click"):
			var current_camera_rotation = camera_rotation_last + _input_relative
			update_rotation(current_camera_rotation * (sensitivity_mouse / 100) * delta)
			camera_rotation_last = current_camera_rotation
			_input_relative = Vector2.ZERO
		elif look_direction.length() > 0:
			update_rotation(look_direction * sensitivity_gamepad * delta)
		else:
			camera_rotation_last = Vector2.ZERO
	
		var is_moving_towards_camera: bool = (
			move_direction.x >= -deadzone and move_direction.x <= deadzone
		)
		if not (is_moving_towards_camera or _is_aiming):
			auto_rotate(move_direction)
	
		camera_rig.rotation.y = wrapf(camera_rig.rotation.y, -PI, PI)
	else:
		if camera_rig.zoom > ZOOM_MIN && camera_rig.zoom < ZOOM_MAX && _state_machine.state.zoom_enabled:
			camera_rig.zoom += ZOOM_STEP
		if (look_direction.length() > 0):
			update_rotation(look_direction * sensitivity_gamepad * delta)


func auto_rotate(move_direction: Vector3) -> void:
	var offset: float = camera_rig.player.rotation.y - camera_rig.rotation.y
	var target_angle: float = (
		camera_rig.player.rotation.y - 2 * PI if offset > PI
		else camera_rig.player.rotation.y + 2 * PI if offset < -PI
		else camera_rig.player.rotation.y
	)
	var sensitivity_autorotate_directioned = sensitivity_autorotate / 10
	if move_direction.y < 0:
		sensitivity_autorotate_directioned = -sensitivity_autorotate_directioned
	camera_rig.rotation.y = lerp(camera_rig.rotation.y, target_angle, 0.015 + sensitivity_autorotate_directioned)

func unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("zoom_in") && _state_machine.state.zoom_enabled:
		camera_rig.zoom += ZOOM_STEP
	elif event.is_action_pressed("zoom_out") && _state_machine.state.zoom_enabled:
		camera_rig.zoom -= ZOOM_STEP
	#elif event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
	elif event is InputEventMouseMotion:
		_input_relative = event.get_relative()

func update_rotation(offset: Vector2) -> void:
	var rotationVector3 = camera_rig.rotation
	rotationVector3.y -= offset.x * -1.0 if is_x_inverted else offset.x
	rotationVector3.x += offset.y * -1.0 if is_y_inverted else offset.y
	rotationVector3.x = clamp(rotationVector3.x, ANGLE_X_MIN, ANGLE_X_MAX)
	rotationVector3.z = 0
	
	if _state_machine._state_name == 'FirstPerson':
		var playerRotationVector3 = camera_rig.player.rotation
		playerRotationVector3.y -= offset.x * -1.0 if is_x_inverted else offset.x
		playerRotationVector3.x += offset.y * -1.0 if is_y_inverted else offset.y
		playerRotationVector3.x = clamp(playerRotationVector3.x, ANGLE_X_MIN, ANGLE_X_MAX)
		playerRotationVector3.z = 0
		camera_rig.player.rotation = playerRotationVector3
	
	camera_rig.rotation = rotationVector3
	
	# OLD WAY
	#camera_rig.rotation.y -= offset.x * -1.0 if is_x_inverted else offset.x
	#camera_rig.rotation.x += offset.y * -1.0 if is_y_inverted else offset.y
	#camera_rig.rotation.x = clamp(camera_rig.rotation.x, ANGLE_X_MIN, ANGLE_X_MAX)
	#camera_rig.rotation.z = 0


# Returns the direction of the camera movement from the player
func get_look_direction() -> Vector2:
	var look_left = Input.get_action_strength("look_left") if collisied_position && collisied_position[0] == 0 else 0
	var look_right = Input.get_action_strength("look_right") if collisied_position && collisied_position[1] == 0 else 0
	var look_up = Input.get_action_strength("look_up") if collisied_position && collisied_position[2] == 0 else 0
	var look_down = Input.get_action_strength("look_down") if collisied_position && collisied_position[3] == 0 else 0
	return Vector2(
			look_right - look_left,
			look_up - look_down
		).normalized()


# Returns the move direction of the character controlled by the player
static func get_move_direction() -> Vector3:
	return Vector3(
		Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
		0,
		Input.get_action_strength("move_back") - Input.get_action_strength("move_front")
	)

func _on_InterpolatedCameraArea_body_entered(body):
	if (! body.is_class("KinematicBody")):
		var look_direction = get_look_direction()
		if _state_machine.state.STATE_NAME != 'first_person':
			_state_machine.transition_to("Camera/FirstPerson")
		if (look_direction.length() > 0):
			collisied_position[0] = 1 if Input.get_action_strength("look_left") else 0
			collisied_position[1] = 1 if Input.get_action_strength("look_right") else 0
			collisied_position[2] = 1 if Input.get_action_strength("look_up") else 0
			collisied_position[3] = 1 if Input.get_action_strength("look_down") else 0
		else:
			collisied_position = [1, 1, 1, 1]
		


func _on_InterpolatedCameraArea_body_exited(body):
	if (! body.is_class("KinematicBody")):
		collisied_position = [0, 0, 0, 0]
