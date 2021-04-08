extends PlayerState
# State for when the player is jumping and falling.

var is_interacting: = 0

func physics_process(delta: float) -> void:
	is_interacting += 1
	if is_interacting >= 50:
		_state_machine.transition_to("Move/Idle")
	_parent.physics_process(delta)


func enter(msg: Dictionary = {}) -> void:
	is_interacting = 0
	skin.transition_to(skin.States.INTERACT)
	_parent.enter()


func exit(target_state: State) -> void:
	_parent.exit(target_state)
