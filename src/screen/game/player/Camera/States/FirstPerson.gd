extends CameraState
# Activates the first person mode for the camera.

onready var tween: = $Tween

export var fov: = 40.0
export var offset_camera_position: = Vector3(0, -3.2, -4.7)
export var camera_rotation_start: Vector3 = Vector3(0, 0, 0)
var zoom_enabled = false
const STATE_NAME = 'first_person'


func unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_aim"):
		_state_machine.transition_to("Camera/Default")
	else:
		_parent.unhandled_input(event)


func process(delta: float) -> void:
	_parent.process(delta)


func enter(msg: Dictionary = {}) -> void:
	camera_rig.spring_arm.translation = camera_rig._position_start + offset_camera_position
	camera_rig.rotation.x = deg2rad(camera_rotation_start.x)
	camera_rig.zoom = 0.5

	tween.interpolate_property(camera_rig.camera, 'fov', camera_rig.camera.fov, fov, 0.5, Tween.TRANS_QUAD, Tween.EASE_OUT)
	tween.start()


func exit(target_state: State) -> void:
	camera_rig.spring_arm.translation = camera_rig.spring_arm._position_start
	camera_rig.rotation.x = deg2rad(target_state.camera_rotation_start.x)

	tween.interpolate_property(camera_rig.camera, 'fov', camera_rig.camera.fov, _parent.fov_default, 0.5, Tween.TRANS_QUAD, Tween.EASE_OUT)
	tween.start()
