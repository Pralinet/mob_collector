import React, { useState, useMemo } from "react";
import { useDataContext, getCropList, getRecipeList } from '../DataContext';

const recipeList = getRecipeList();

const FoodMenu = () => {
    const { 
        recipes
        } = useDataContext();

    const itemStatus = () => {
        return recipes.map((recipe, index) => {
            return <div>{recipeList[index].name}:{recipe.stock}</div>
        })
    }

    return (
    <div>
        {itemStatus()}
    </div>
    );
}

export default FoodMenu;