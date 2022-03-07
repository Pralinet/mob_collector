import userinit from "./json/userinit.json";

import goods_data from "./json/goods.json";
import ores_data from "./json/ores.json";
import crops_data from "./json/crops.json";
import rooms_data from "./json/rooms.json";
import mobs_data from "./json/mobs.json";

import { UserData, UserGoodsData, UserOreData, UserCropData, UserRoomData, UserSpaceData, UserMobData } from "./ts/UserData";
import {Goods, Ore, Crop, Room, Mob} from "./ts/SystemData"

import { calcLotPrice, getIndexes } from "./utils";


const goodsList: Goods[] = goods_data;
const oreList: Ore[] = ores_data;
const cropList: Crop[] = crops_data;
const roomList: Room[] = rooms_data;
const mobList: Mob[] = mobs_data;
