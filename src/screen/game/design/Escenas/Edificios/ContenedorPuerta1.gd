extends Spatial


# Declare member variables here. Examples:
# var a = 2
# var b = "text"
onready var animation_tree: AnimationTree = $AnimationTree
onready var _playback: AnimationNodeStateMachinePlayback = animation_tree["parameters/playback"]
var inDoor = false
var currentState = 'closed'
export var inverted: = false
var secondsClickedToOpenOrClose = 0
var secondsClickedNeddedToOpenOrClose = 1


# Called when the node enters the scene tree for the first time.
func _ready():
	animation_tree.active = true
	if (! inverted):
		_playback.travel('Close')
	#pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if (inDoor && Input.is_action_pressed("interact")):
		secondsClickedToOpenOrClose += delta
		if (secondsClickedToOpenOrClose > secondsClickedNeddedToOpenOrClose):
			secondsClickedToOpenOrClose = 0
			if (currentState == 'closed'):
				if (inverted):
					_playback.travel('Close')
				else:
					_playback.travel('Open')
				currentState = 'opened'
			elif (currentState == 'opened'):
				if (inverted):
					_playback.travel('Open')
				else:
					_playback.travel('Close')
				currentState = 'closed'
	else:
		secondsClickedToOpenOrClose = 0


func _on_Puerta1AccionArea_body_entered(body):
	if (body.get('canOpenDoor')):
		inDoor = true


func _on_Puerta1AccionArea_body_exited(body):
	if (body.get('canOpenDoor')):
		inDoor = false
