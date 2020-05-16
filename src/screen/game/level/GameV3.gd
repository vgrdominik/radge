extends Node

var firstTime = true
const playerScene = preload('res://game/player/Player.tscn')
var playerNode

func _ready() -> void:
	#Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	#OS.window_fullscreen = not OS.window_fullscreen
	playerNode = playerScene.instance()
	
	$MaterialRequest.request("http://api-radge.valentigamez.com/api/material")

func _input(event: InputEvent) -> void:
	#if event.is_action_pressed("click"):
	#	if Input.get_mouse_mode() != Input.MOUSE_MODE_CAPTURED:
	#		Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	if event.is_action_pressed("toggle_mouse_captured"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		#else:
		#	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
		get_tree().set_input_as_handled()

	if event.is_action_pressed("toggle_fullscreen"):
		OS.window_fullscreen = not OS.window_fullscreen
		get_tree().set_input_as_handled()

func _on_HTTPRequest_request_completed(result, response_code, headers, body):
	var json = JSON.parse(body.get_string_from_utf8())
	print()
	for elementToInstance in json.result:
		var scene = load("res://game/design/Escenas/" + str(elementToInstance.scn) + ".tscn")
		var node = scene.instance()
		node.translate(Vector3(elementToInstance.t_x, elementToInstance.t_y, elementToInstance.t_z))
		node.rotate_x(elementToInstance.r_x)
		node.rotate_y(elementToInstance.r_y)
		node.rotate_z(elementToInstance.r_z)
		node.scale_object_local(Vector3(elementToInstance.s_x, elementToInstance.s_y, elementToInstance.s_z))
		add_child(node)
	if firstTime:
		add_child(playerNode)
		firstTime = false
