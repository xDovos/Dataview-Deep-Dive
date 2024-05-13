directions = {North: [West, East, South], East: [North, South, West], South: [East, West, North], West: [South, North, East]}
set_farm_size(10)
visited = []
maze = dict()
# [false = hedge, True = Free]
for x in range(get_world_size()):
	for y in range(get_world_size()):
		maze[(x,y)] = {North: [False, (x,y+1)], East:[False, (x+1,y)], South: [False, (x,y-1)], West: [False, (x-1,y)]}

def buildMaze():
	harvest()
	while get_entity_type() != Entities.Hedge:
		if get_entity_type() == Entities.Treasure:
			break
		if num_items(Items.Fertilizer) <= 2:
			trade(Items.Fertilizer)
		if get_entity_type() != Entities.Bush:
			plant(Entities.Bush)
		if get_entity_type() == Entities.Bush:
			use_item(Items.Fertilizer)

def tryMove(xy, dir):
	if maze[xy][dir][0] == True:
		return True
	if move(dir) == True:
		move(directions[dir][2])
		return True
	else:
		return False
	
def updateHedges():
	x = get_pos_x()
	y = get_pos_y()
	maze[(x,y)] = {North: [tryMove((x,y), North), (x,y+1)], East:[tryMove((x,y),East), (x+1,y)], South: [tryMove((x,y),South), (x,y-1)], West: [tryMove((x,y),West), (x-1,y)]}
	
def nextMove(xy, dir):
	nextDir = dir
	if maze[xy][directions[dir][0]][0] == True:
		nextDir = directions[dir][0]
	elif maze[xy][directions[dir][1]][0] == True:
		quick_print("Right")
		nextDir = directions[dir][1]
	elif maze[xy][directions[dir][2]][0] == True and tryMove(xy, dir) == False:
		nextDir = directions[dir][2]
	return nextDir
	
def moving(dir):
	if get_entity_type() == Entities.Treasure:
		return True
	x = get_pos_x()
	y = get_pos_y()
	nextDir = nextMove((x,y), dir)
	move(nextDir)
	visited.append((x,y))
	updateHedges()
	return moving(nextDir)	
	
buildMaze()
updateHedges()
if moving(North) == True:
	harvest()



















