def twoSum(nums, target):
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []

# Read input from stdin
import sys
import ast

# Read the input (first line is nums array, second line is target)
input_lines = sys.stdin.read().strip().split('\n')
nums = ast.literal_eval(input_lines[0])  # Convert string "[2,7,11,15]" to list
target = int(input_lines[1])  # Convert string "9" to int

# Call the function and print result
result = twoSum(nums, target)
# Format output without spaces: [0,1] instead of [0, 1]
print('[' + ','.join(map(str, result)) + ']') 