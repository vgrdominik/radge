extends CameraState
# Rotates the camera around the character, delegating all the work to its parent state.

export var camera_rotation_start: Vector3 = Vector3(-15, 0, 0)
var zoom_enabled = true
const STATE_NAME = 'default'

func unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_aim"):
		_state_machine.transition_to("Camera/Aim")
	else:
		_parent.unhandled_input(event)


func process(delta: float) -> void:
	_parent.process(delta)
